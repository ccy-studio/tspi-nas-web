<template>
    <div class="system-dept-container layout-padding">
        <el-card shadow="hover" class="layout-padding-auto">
            <div>
                <el-button class="mr30" type="primary" @click="onClose">
                    <el-icon>
                        <ele-ArrowLeftBold />
                    </el-icon>返回
                </el-button>
                <el-text class="mx-1" tag="b" size="large" type="primary">{{ state.bucketsName }}</el-text>
            </div>
            <div class="system-dept-search mb15 mt30">
                <el-input v-model="state.tableData.keyword" clearable size="default" placeholder="关键字查询"
                    style="max-width: 180px"> </el-input>
                <el-button size="default" type="primary" class="ml10" @click="getTableData">
                    <el-icon>
                        <ele-Search />
                    </el-icon>
                    查询
                </el-button>
                <el-button v-auth="'admin'" size="default" type="success" class="ml10" @click="onOpenAddDept('add')">
                    <el-icon>
                        <ele-FolderAdd />
                    </el-icon>
                    新增ACL策略
                </el-button>
            </div>
            <el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%" row-key="id"
                default-expand-all :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
                <el-table-column label="排序" show-overflow-tooltip width="80">
                    <template #default="scope">
                        {{ scope.$index }}
                    </template>
                </el-table-column>

                <el-table-column prop="userAccount" label="用户账户" show-overflow-tooltip></el-table-column>
                <el-table-column prop="nickName" label="用户昵称" show-overflow-tooltip></el-table-column>
                <el-table-column prop="effect" label="授权策略" show-overflow-tooltip>
                    <template #default="scope">
                        {{ scope.row.effect ? '允许' : '拒绝' }}
                    </template>
                </el-table-column>
                <el-table-column prop="acl" label="ACL" show-overflow-tooltip>
                    <template #default="scope">
                        <template v-if="scope.row.acl.includes('super')">管理 </template>
                        <template v-if="scope.row.acl.includes('get_obj')">读 </template>
                        <template v-if="scope.row.acl.includes('put_obj')">写 </template>
                        <template v-if="scope.row.acl.includes('del_obj')">删 </template>
                        <template v-if="scope.row.acl.includes('share_obj')">分享 </template>
                    </template>
                </el-table-column>
                <el-table-column prop="isResContain" label="命中状态" show-overflow-tooltip>
                    <template #default="scope">
                        <template v-if="!scope.row.acl.includes('super')">{{ scope.row.isResContain ? '命中' : '未命中'
                            }}</template>
                        <template v-else>命中</template>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" show-overflow-tooltip></el-table-column>
                <el-table-column prop="updateTime" label="修改时间" show-overflow-tooltip></el-table-column>

                <el-table-column label="操作" show-overflow-tooltip width="140">
                    <template #default="scope">
                        <el-button v-if="!scope.row.acl.includes('super')" v-auth="'admin'" size="small" text
                            type="primary" @click="onOpenEditDept('edit', scope.row)">修改</el-button>
                        <el-button v-if="!scope.row.acl.includes('super')" size="small" text type="primary"
                            @click="onTabelRowDel(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination @size-change="getTableData" @current-change="getTableData" class="mt15"
                :page-sizes="[10, 20, 30]" v-model:current-page="state.tableData.pageNum" background
                v-model:page-size="state.tableData.pageSize" layout="total, sizes, prev, pager, next, jumper"
                :total="state.tableData.total">
            </el-pagination>
        </el-card>
        <AclDialog ref="dialogRef" @refresh="getTableData()" />
    </div>
</template>

<script setup lang="ts" name="systemDept">
import { defineAsyncComponent, ref, reactive, onMounted } from 'vue';
import service from '/@/utils/request';
import { useRoute, useRouter } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";

const route = useRoute();
const router = useRouter();
// 引入组件
const AclDialog = defineAsyncComponent(() => import('./dialogAcl.vue'));

// 定义变量内容
const dialogRef = ref();
const state = reactive({
    id: null,
    bucketsName: '',
    tableData: {
        data: [],
        loading: false,
        keyword: '',
        action: '',
        total: 0,
        pageSize: 10,
        pageNum: 1
    },
});

// 初始化表格数据
const getTableData = () => {
    state.tableData.loading = true;
    service.request({
        method: "get",
        url: "/sys/buckets/acl/list",
        params: {
            bid: state.id,
            action: state.tableData.action,
            keyword: state.tableData.keyword,
            current: state.tableData.pageNum,
            size: state.tableData.pageSize
        }
    }).then((res) => {
        state.tableData.total = res.data.total;
        state.tableData.data = res.data.rows;
        state.tableData.loading = false;
    })
};
// 打开新增菜单弹窗
const onOpenAddDept = (type: string) => {
    dialogRef.value.openDialog(type,state.id);
};
// 打开编辑菜单弹窗
const onOpenEditDept = (type: string, row: any) => {
    dialogRef.value.openDialog(type, row);
};

// 删除当前行
const onTabelRowDel = (row: any) => {
    ElMessageBox.confirm(`此操作将永久删除该ACL策略是否继续?`, '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(() => {
            service.request({
                method: "post",
                url: "/sys/buckets/acl/delete",
                data: {
                    id: row.id
                }
            }).then(() => {
                ElMessage.success('删除成功');
                getTableData();
            }).catch(e => {
                ElMessage.error(e);
            })
        })
        .catch(() => { });
};

const onClose = () => {
    router.back();
}

// 页面加载时
onMounted(() => {
    state.id = route.params.id as any;
    if (!state.id || state.id == null) {
        router.replace("/system/buckets");
        return;
    }
    state.bucketsName = route.query.bucketsName as any;
    getTableData();
});
</script>
