<template>
	<div class="system-user-container layout-padding">
		<el-card shadow="hover" class="layout-padding-auto">
			<div class="system-user-search mb15">
				<el-input size="default" v-model="state.tableData.param.keyword" placeholder="请输入用户名称"
					style="max-width: 180px"></el-input>
				<el-button size="default" type="primary" class="ml10" @click="getTableData">
					<el-icon>
						<ele-Search />
					</el-icon>
					查询
				</el-button>
				<el-button size="default" type="success" class="ml10" @click="onOpenAddUser('add')">
					<el-icon>
						<ele-FolderAdd />
					</el-icon>
					新增用户
				</el-button>
			</div>
			<el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
				<el-table-column type="index" label="序号" width="60" />
				<el-table-column prop="userAccount" label="用户账户" show-overflow-tooltip></el-table-column>
				<el-table-column prop="nickName" label="昵称" show-overflow-tooltip></el-table-column>
				<el-table-column prop="mobile" label="手机号" show-overflow-tooltip></el-table-column>
				<el-table-column prop="accessKey" label="AK" width="200" show-overflow-tooltip></el-table-column>
				<el-table-column prop="groupName" label="组名称" width="200" show-overflow-tooltip></el-table-column>
				<el-table-column prop="createTime" label="创建时间" show-overflow-tooltip></el-table-column>
				<el-table-column label="操作" width="250">
					<template #default="scope">
						<el-button size="small" text type="primary"
							@click="onOpenEditUser('edit', scope.row)">修改</el-button>
						<el-button v-if="scope.row.id != 1" size="small" text type="primary"
							@click="onRowDel(scope.row)">删除</el-button>
						<el-button v-if="scope.row.id != 1" size="small" text type="primary"
							@click="onResetPwd(scope.row.id)">重置密码</el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination @size-change="onHandleSizeChange" @current-change="onHandleCurrentChange" class="mt15"
				:pager-count="5" :page-sizes="[10, 20, 30]" v-model:current-page="state.tableData.param.pageNum"
				background v-model:page-size="state.tableData.param.pageSize"
				layout="total, sizes, prev, pager, next, jumper" :total="state.tableData.total">
			</el-pagination>
		</el-card>
		<UserDialog ref="userDialogRef" @refresh="getTableData()" />
	</div>
</template>

<script setup lang="ts" name="systemUser">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import service from '/@/utils/request';

// 引入组件
const UserDialog = defineAsyncComponent(() => import('/@/views/system/user/dialog.vue'));

// 定义变量内容
const userDialogRef = ref();
const state = reactive({
	tableData: {
		data: [],
		total: 0,
		loading: false,
		param: {
			pageNum: 1,
			pageSize: 10,
			keyword: ""
		},
	},
});

// 初始化表格数据
const getTableData = () => {
	state.tableData.loading = true;
	service.request({
		method: "get",
		url: "/sys/user/list",
		params: {
			current: state.tableData.param.pageNum,
			size: state.tableData.param.pageSize,
			keyword: state.tableData.param.keyword
		}
	}).then(res => {
		state.tableData.data = res.data.rows
		state.tableData.total = res.data.total
		state.tableData.loading = false
	})
};
// 打开新增用户弹窗
const onOpenAddUser = (type: string) => {
	userDialogRef.value.openDialog(type);
};
// 打开修改用户弹窗
const onOpenEditUser = (type: string, row: RowUserType) => {
	userDialogRef.value.openDialog(type, row);
};
// 删除用户
const onRowDel = (row: any) => {
	ElMessageBox.confirm(`此操作将永久删除账户名称：“${row.nickName}”，是否继续?`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			service.request({
				method: "post",
				url: "/sys/user/delete",
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
// 分页改变
const onHandleSizeChange = (val: number) => {
	state.tableData.param.pageSize = val;
	getTableData();
};
// 分页改变
const onHandleCurrentChange = (val: number) => {
	state.tableData.param.pageNum = val;
	getTableData();
};
// 页面加载时
onMounted(() => {
	getTableData();
});


const onResetPwd = (id: any) => {
	ElMessageBox.confirm(`此操作将重置此用户的密码是否继续?`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			service.request({
				method: "post",
				url: "/sys/user/reset-pwd",
				data: {
					id
				}
			}).then(() => {
				ElMessage.success('重置成功');
			}).catch(e => {
				ElMessage.error(e);
			})
		})
		.catch(() => { });
}

</script>

<style scoped lang="scss">
.system-user-container {
	:deep(.el-card__body) {
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: auto;

		.el-table {
			flex: 1;
		}
	}
}
</style>
