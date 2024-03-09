<template>
	<div class="system-menu-container layout-pd">
		<el-card shadow="hover">
			<div class="system-menu-search mb15">
				<el-input v-model="state.query.keyword" clearable size="default" placeholder="关键字查询"
					style="max-width: 180px"></el-input>

				<el-button size="default" type="primary" class="ml10" @click="getTableData">
					<el-icon>
						<ele-Search />
					</el-icon>
					查询
				</el-button>
				<el-button size="default" type="success" class="ml10" @click="onOpenAddMenu">
					<el-icon>
						<ele-FolderAdd />
					</el-icon>
					新增资源
				</el-button>
			</div>
			<el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%" row-key="id"
				:tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
				<el-table-column prop="device" label="设备名称" show-overflow-tooltip></el-table-column>
				<el-table-column prop="mountPath" width="140" label="挂载点路径" show-overflow-tooltip></el-table-column>
				<el-table-column prop="diskId" label="ID标识" show-overflow-tooltip></el-table-column>
				<el-table-column prop="createTime" label="创建时间" show-overflow-tooltip></el-table-column>

				<el-table-column label="操作" show-overflow-tooltip width="140">
					<template #default="scope">
						<el-button size="small" text type="primary"
							@click="onOpenEditMenu('edit', scope.row)">修改</el-button>
						<el-button size="small" text type="primary" @click="onTabelRowDel(scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination @size-change="getTableData" @current-change="getTableData" class="mt15"
				:page-sizes="[10, 20, 30]" v-model:current-page="state.query.current" background
				v-model:page-size="state.query.size" layout="total, sizes, prev, pager, next, jumper"
				:total="state.query.total">
			</el-pagination>
		</el-card>
		<MenuDialog ref="menuDialogRef" @refresh="getTableData()" />
	</div>
</template>

<script setup lang="ts" name="systemMenu">
import { defineAsyncComponent, ref, onMounted, reactive } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import service from '/@/utils/request';

// 引入组件
const MenuDialog = defineAsyncComponent(() => import('./dialog.vue'));

// 定义变量内容
const menuDialogRef = ref();
const state = reactive({
	query: {
		keyword: '',
		size: 10,
		current: 1,
		total: 0
	},
	tableData: {
		data: [],
		loading: true,
	},
});

// 获取路由数据，真实请从接口获取
const getTableData = () => {
	state.tableData.loading = true;
	service.request({
		method: "get",
		url: "/sys/hard-disk/list",
		params: {
			current: state.query.current,
			size: state.query.size,
			keyword: state.query.keyword,
		}
	}).then((res) => {
		state.tableData.data = res.data.rows;
		state.query.total = res.data.total;
		state.tableData.loading = false;
	})
};
// 打开新增菜单弹窗
const onOpenAddMenu = (type: string) => {
	menuDialogRef.value.openDialog(type);
};
// 打开编辑菜单弹窗
const onOpenEditMenu = (type: string, row: any) => {
	menuDialogRef.value.openDialog(type, row);
};
// 删除当前行
const onTabelRowDel = (row: any) => {
	ElMessageBox.confirm(`此操作将永久删除该磁盘配置：${row.device}, 是否继续?`, '提示', {
		confirmButtonText: '删除',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			service.request({
				method: "post",
				url: "/sys/hard-disk/delete",
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
// 页面加载时
onMounted(() => {
	getTableData();
});
</script>
