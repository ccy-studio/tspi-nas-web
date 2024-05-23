<template>
	<div class="system-role-dialog-container">
		<el-dialog :rules="rules" :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="769px">
			<el-form :rules="rules" ref="roleDialogFormRef" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="组名称" prop="groupName">
							<el-input v-model="state.ruleForm.groupName" placeholder="请输入用户组名称" clearable></el-input>
						</el-form-item>
					</el-col>

					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="绑定资源">
							<el-tree ref="treeRef" style="max-width: 600px" :data="state.resArr" show-checkbox
								node-key="id" default-expand-all highlight-current
								:default-checked-keys="state.ruleForm.resIds" :props="defaultProps" />
						</el-form-item>
					</el-col>

				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel" size="default">取 消</el-button>
					<el-button type="primary" @click="onSubmit" size="default">{{ state.dialog.submitTxt }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="systemRoleDialog">
import { reactive, ref, nextTick } from 'vue';
import service from '/@/utils/request';
import type { FormInstance, ElTree } from 'element-plus'

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const roleDialogFormRef = ref<FormInstance>();
const treeRef = ref<InstanceType<typeof ElTree>>()

const rules = reactive({
	groupName: [{ required: true, message: '请输入完整', trigger: 'blur' }],
})

const defaultProps = {
	label: 'resName',
}

const state = reactive({
	ruleForm: {
		id: null,
		groupName: null,
		resIds: []
	},
	resArr: [],
	dialog: {
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
	},
});

// 打开弹窗
const openDialog = (type: string, row: any) => {
	getResList();
	nextTick(() => {
		roleDialogFormRef.value?.resetFields();
	})
	if (type === 'edit') {
		getDetail(row.id)
		state.dialog.title = '修改用户组';
		state.dialog.submitTxt = '修 改';
	} else {
		state.ruleForm.id = null;
		state.dialog.title = '新增用户组';
		state.dialog.submitTxt = '新 增';
		// 清空表单，此项需加表单验证才能使用
		nextTick(() => {
			treeRef.value?.setCheckedKeys([]);
		});
	}
	state.dialog.isShowDialog = true;
};
// 关闭弹窗
const closeDialog = () => {
	state.dialog.isShowDialog = false;
};
// 取消
const onCancel = () => {
	closeDialog();
};
// 提交
const onSubmit = () => {
	state.ruleForm.resIds = treeRef.value!.getCheckedKeys() as any;
	roleDialogFormRef.value!.validate((valid: any) => {
		if (valid) {
			//请求接口
			service.request({
				method: "post",
				url: "/sys/user-group/edit",
				data: state.ruleForm
			}).then(() => {
				closeDialog(); // 关闭弹窗
				emit('refresh');
			})
		}
	})
};

//查询获取全部的资源
const getResList = () => {
	service.request({
		method: "get",
		url: "/sys/resources/list",
		params: {
			current: 1,
			size: -1
		}
	}).then(res => {
		state.resArr = res.data.rows;
	})
};

const getDetail = (id: any) => {
	service.request({
		method: "get",
		url: "/sys/user-group/get",
		params: {
			id
		}
	}).then(res => {
		let dat = res.data;
		dat.resIds = dat.resourceItems.map((v:any)=>v.id);
		state.ruleForm = dat;
		nextTick(()=>{
			treeRef.value?.setCheckedKeys(state.ruleForm.resIds);
		})
	})
}

// 暴露变量
defineExpose({
	openDialog,
});
</script>

<style scoped lang="scss"></style>
