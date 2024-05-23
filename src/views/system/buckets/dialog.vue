<template>
	<div class="system-dept-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="769px">
			<el-form ref="dialogFormRef" :rules="rules" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35">

					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="桶名称" prop="bucketsName">
							<el-input :disabled="state.ruleForm.id != null" type="text"
								v-model="state.ruleForm.bucketsName"></el-input>
						</el-form-item>
					</el-col>

					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="挂载点" prop="mountPoint">
							<el-input :disabled="state.ruleForm.id != null" type="text"
								v-model="state.ruleForm.mountPoint"></el-input>
						</el-form-item>
					</el-col>

					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="绑定资源" prop="resId">
							<el-select :disabled="state.ruleForm.id != null" v-model="state.ruleForm.resId"
								placeholder="请选择绑定的资源">
								<el-option v-for="item in state.resList" :key="item.id" :label="item.resName"
									:value="item.id" />
							</el-select>
						</el-form-item>
					</el-col>

					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="静态页面" prop="staticPage">
							<el-switch v-model="state.ruleForm.staticPage" active-text="开启" inactive-text="关闭" />
						</el-form-item>
					</el-col>

					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="权限" prop="permissions">
							<el-radio-group v-model="state.ruleForm.permissions">
								<el-radio :value="0">私有</el-radio>
								<el-radio :value="1">公读公写</el-radio>
								<el-radio :value="2">公读私写</el-radio>
							</el-radio-group>
						</el-form-item>
					</el-col>

					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="权限范围" prop="permissionsScope">
							<el-radio-group v-model="state.ruleForm.permissionsScope">
								<el-radio :value="0" v-if="state.ruleForm.permissions == 0">私有</el-radio>
								<el-radio :value="1" v-if="state.ruleForm.permissions != 0">资源内公开</el-radio>
								<el-radio :value="2" v-if="state.ruleForm.permissions != 0">全公开</el-radio>
							</el-radio-group>
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
import { reactive, ref, nextTick, watch } from 'vue';
import service from '/@/utils/request';
import { ElMessage, type FormInstance } from 'element-plus'

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const dialogFormRef = ref<FormInstance>();
const rules = reactive({
	bucketsName: [{ required: true, message: '请输入完整', trigger: 'blur' }],
	resId: [{ required: true, message: '请输入完整', trigger: 'blur' }],
	permissions: [{ required: true, message: '请输入完整', trigger: 'blur' }],
	permissionsScope: [{ required: true, message: '请输入完整', trigger: 'blur' }],
	staticPage: [{ required: true, message: '请输入完整', trigger: 'blur' }],
	mountPoint: [{ required: true, message: '请输入完整', trigger: 'blur' }],
})

const state = reactive({
	ruleForm: {
		id: null,
		mountPoint: '',
		bucketsName: '',
		resId: null,
		permissions: 0,
		permissionsScope: 0,
		staticPage: false
	},
	resList: <any>[],
	dialog: {
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
	},
});

watch(() => state.ruleForm.permissions, (newVal, oldVal) => {
	if (newVal == 0) {
		state.ruleForm.permissionsScope = 0;
	} else {
		state.ruleForm.permissionsScope = 1;
	}
});

// 打开弹窗
const openDialog = (type: string, row: any) => {
	getResList();
	nextTick(() => {
		dialogFormRef.value?.resetFields();
	});
	if (type === 'edit') {
		service.request({
			method: "get",
			url: "/sys/buckets/get",
			params: {
				bid: row.id
			}
		}).then(rsp => {
			state.ruleForm = rsp.data;
		}).catch(e => ElMessage.error(e));
		state.dialog.title = '修改';
		state.dialog.submitTxt = '修 改';
	} else {
		state.dialog.title = '新增';
		state.dialog.submitTxt = '新 增';
		state.ruleForm.id = null;
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
	if (state.ruleForm.permissions == 0) {
		state.ruleForm.permissionsScope = 0;
	}
	dialogFormRef.value?.validate((valid: any) => {
		if (valid) {
			//请求接口
			service.request({
				method: "post",
				url: "/sys/buckets/edit",
				data: state.ruleForm
			}).then(() => {
				closeDialog(); // 关闭弹窗
				emit('refresh');
			})
		}
	})
};

const getResList = () => {
	service.request({
		method: "get",
		url: "/sys/resources/list",
		params: {
			size: -1
		}
	}).then(rsp => {
		state.resList = rsp.data.rows;
	}).catch(e => {
		ElMessage.error(e)
	})
}

// 暴露变量
defineExpose({
	openDialog,
});
</script>
