<template>
	<div class="system-dept-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto">
			<div class="system-dept-search mb15">
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
					新增存储桶
				</el-button>
			</div>
			<el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%" row-key="id"
				default-expand-all :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
				<el-table-column label="排序" show-overflow-tooltip width="80">
					<template #default="scope">
						{{ scope.$index }}
					</template>
				</el-table-column>

				<el-table-column prop="bucketsName" label="存储桶名称" show-overflow-tooltip>
					<template #default="scope">
						<el-link @click="onOpenBucketsInfo(scope.row)" type="primary">{{ scope.row.bucketsName
							}}</el-link>
					</template>
				</el-table-column>
				<el-table-column prop="mountPoint" label="挂载点" show-overflow-tooltip></el-table-column>
				<el-table-column prop="resName" label="所属资源" show-overflow-tooltip></el-table-column>
				<el-table-column prop="createTime" label="创建时间" show-overflow-tooltip></el-table-column>
				<el-table-column prop="isDelete" label="状态" show-overflow-tooltip>
					<template #default="scope">
						<el-tag v-if="scope.row.isDelete == 0" type="success">正常</el-tag>
						<el-tooltip v-else class="box-item" effect="dark" content="挂载路径在系统内不存在"
							placement="bottom-end"><el-tag type="danger">失效</el-tag>
						</el-tooltip>
					</template>
				</el-table-column>

				<el-table-column label="操作" show-overflow-tooltip width="200">
					<template #default="scope">
						<el-button v-auth="'admin'" size="small" text type="primary"
							@click="onOpenEditDept('edit', scope.row)">修改/查看</el-button>
						<el-button v-auth="'admin'" size="small" text type="primary"
							@click="onDel(scope.row.id)">删除</el-button>
						<el-button v-if="scope.row.isDelete != 0" v-auth="'admin'" size="small" text type="primary"
							@click="onTryRecovery(scope.row)">失效恢复</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-card>
		<BucketDialog ref="dialogRef" @refresh="getTableData()" />
	</div>
</template>

<script setup lang="ts" name="systemDept">
import { defineAsyncComponent, ref, reactive, onMounted } from 'vue';
import service from '/@/utils/request';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus'

const router = useRouter();

// 引入组件
const BucketDialog = defineAsyncComponent(() => import('./dialog.vue'));

// 定义变量内容
const dialogRef = ref();
const state = reactive({
	tableData: {
		data: [],
		loading: false,
		keyword: ''
	},
});

// 初始化表格数据
const getTableData = () => {
	state.tableData.loading = true;
	service.request({
		method: "get",
		url: "/sys/buckets/list",
		params: {
			keyword: state.tableData.keyword,
		}
	}).then((res) => {
		state.tableData.data = res.data;
		state.tableData.loading = false;
	})
};
// 打开新增菜单弹窗
const onOpenAddDept = (type: string) => {
	dialogRef.value.openDialog(type);
};
// 打开编辑菜单弹窗
const onOpenEditDept = (type: string, row: any) => {
	dialogRef.value.openDialog(type, row);
};

//打开存储桶详情页面
const onOpenBucketsInfo = (row: any) => {
	router.push({
		name: "systemBucketsDetail",
		params: {
			id: row.id
		},
		query: {
			bucketsName: row.bucketsName
		}

	})
}

const onTryRecovery = (row: any) => {
	service.request({
		method: "post",
		url: "/sys/buckets/tryRecovery",
		data: {
			id: row.id,
		}
	}).then((res) => {
		if (res.data) {
			ElMessage({
				message: '恢复成功',
				grouping: true,
				type: 'success',
			})
			getTableData()
		} else {
			ElMessage({
				message: '恢复失败,请检查挂载路径是否存在',
				grouping: true,
				type: 'error',
			})
		}
	})
}

const onDel = (id: number) => {
	service.request({
		method: "post",
		url: "/sys/buckets/delete",
		data: {
			id
		}
	}).then(() => {
		ElMessage({
			message: '删除成功',
			grouping: true,
			type: 'success',
		})
		getTableData()
	}).catch(() => {
		ElMessage({
			message: '删除失败',
			grouping: true,
			type: 'success',
		})
	})
}

// 页面加载时
onMounted(() => {
	getTableData();
});
</script>
