<template>
	<div class="system-menu-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="769px">
			<el-form :rules="rules" ref="menuDialogFormRef" :model="state.ruleForm" size="default" label-width="80px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="资源名称" prop="resName">
							<el-input v-model="state.ruleForm.resName" placeholder="资源名称" clearable></el-input>
						</el-form-item>
					</el-col>


					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="资源类型" prop="resType">
							<el-select v-model="state.ruleForm.resType" class="ml10" clearable placeholder="资源描述"
								style="width: 240px">
								<el-option v-for="item in state.resTypes" :key="item.value" :label="item.label"
									:value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>

					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="资源路径" prop="resPath">
							<el-input v-model="state.ruleForm.resPath" placeholder="资源路径" clearable></el-input>
						</el-form-item>
					</el-col>


					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="资源描述">
							<el-input v-model="state.ruleForm.resDesc" placeholder="资源描述" clearable></el-input>
						</el-form-item>
					</el-col>



					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="是否可用">
							<el-radio-group v-model="state.ruleForm.enable">
								<el-radio :label="true">使能</el-radio>
								<el-radio :label="false">禁用</el-radio>
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

<script setup lang="ts" name="systemMenuDialog">
import { reactive, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
// import { setBackEndControlRefreshRoutes } from "/@/router/backEnd";

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const menuDialogFormRef = ref();

const rules = reactive({
	resName: [{ required: true, message: '请输入完整', trigger: 'blur' }],
	resType: [{ required: true, message: '请输入完整', trigger: 'blur' }],
	resPath: [{ required: true, message: '请输入完整', trigger: 'blur' }],
})

const state = reactive({
	resTypes: [ //资源类型 0:FILE,1:SMB,2:FTP,3.WebDav
		{
			value: 0,
			label: "File"
		},
		{
			value: 1,
			label: "SMB"
		},
		{
			value: 2,
			label: "FTP"
		},
		{
			value: 3,
			label: "WebDav"
		},
	],
	ruleForm: {
		id: null,
		resName: '',
		resDesc: '',
		resType: 0,
		resPath: '',
		enable: true,
	},
	dialog: {
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
	},
});

// 打开弹窗
const openDialog = (type: string, row?: any) => {
	if (type === 'edit') {
		// 模拟数据，实际请走接口
		state.ruleForm = row;
		state.dialog.title = '修改菜单';
		state.dialog.submitTxt = '修 改';
	} else {
		state.dialog.title = '新增菜单';
		state.dialog.submitTxt = '新 增';
		// 清空表单，此项需加表单验证才能使用
		// nextTick(() => {
		// 	menuDialogFormRef.value.resetFields();
		// });
	}
	state.dialog.type = type;
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
	closeDialog(); // 关闭弹窗
	emit('refresh');
	// if (state.dialog.type === 'add') { }
	// setBackEndControlRefreshRoutes() // 刷新菜单，未进行后端接口测试
};
// 页面加载时
onMounted(() => {

});

// 暴露变量
defineExpose({
	openDialog,
});
</script>
