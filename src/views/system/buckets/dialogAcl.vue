<template>
	<div class="system-dept-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="769px">
			<el-form ref="dialogFormRef" :rules="rules" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="用户" prop="userId">
							<el-select v-model="state.ruleForm.userId" filterable remote reserve-keyword
								placeholder="选择用户" :remote-method="getUserArr" :loading="userLoading">
								<el-option v-for="item in state.userArr" :key="item.id" :label="item.userAccount"
									:value="item.id" />
							</el-select>
						</el-form-item>
					</el-col>

					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="授权策略" prop="effect">
							<el-switch v-model="state.ruleForm.effect" active-text="允许" inactive-text="拒绝" />
						</el-form-item>
					</el-col>

					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="ACL" prop="acl">
							<el-checkbox-group v-model="state.ruleForm.acl">
								<el-checkbox value="get_obj" label="读" />
								<el-checkbox value="put_obj" label="写" />
								<el-checkbox value="del_obj" label="删" />
								<el-checkbox value="share_obj" label="分享" />
							</el-checkbox-group>

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

<script setup lang="ts" name="systemDeptDialog">
import { reactive, ref, nextTick } from 'vue';
import service from '/@/utils/request';
import { ElMessage, FormInstance } from 'element-plus'

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const dialogFormRef = ref<FormInstance>();
const rules = reactive({
	userId: [{ required: true, message: '请输入完整', trigger: 'blur' }],
	effect: [{ required: true, message: '请输入完整', trigger: 'blur' }],
	acl: [{ required: true, message: '请输入完整', trigger: 'blur' }],
})

const userLoading = ref(false);

const state = reactive({
	ruleForm: {
		bucketsId: null,
		userId: null,
		effect: true,
		acl: <any>[],
	},
	userArr: <any>[],
	dialog: {
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
	},
});

// 打开弹窗
const openDialog = (type: string, row: any) => {
	getUserArr('');
	nextTick(() => {
		dialogFormRef.value?.resetFields();
	});
	if (type === 'edit') {
		console.log(row);
		state.ruleForm = row;
		state.dialog.title = '修改';
		state.dialog.submitTxt = '修 改';
	} else {
		state.ruleForm.bucketsId = row;
		state.dialog.title = '新增';
		state.dialog.submitTxt = '新 增';
		state.ruleForm.userId = null;
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
	dialogFormRef.value?.validate((valid: any) => {
		if (valid) {
			//请求接口
			service.request({
				method: "post",
				url: "/sys/buckets/acl/edit",
				data: state.ruleForm
			}).then(() => {
				closeDialog(); // 关闭弹窗
				emit('refresh');
			}).catch(e => ElMessage.error(e))
		}
	})
};

const getUserArr = (query: string) => {
	userLoading.value = true;
	service.request({
		method: "get",
		url: "/sys/user/list",
		params: {
			size: -1,
			keyword: query
		}
	}).then(rsp => {
		state.userArr = rsp.data.rows;
	}).finally(() => userLoading.value = false)
}

// 暴露变量
defineExpose({
	openDialog,
});
</script>
