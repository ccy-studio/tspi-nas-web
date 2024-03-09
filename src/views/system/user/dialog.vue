<template>
	<div class="system-user-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="769px">
			<el-form :rules="rules" ref="userDialogFormRef" :model="state.ruleForm" size="default" label-width="90px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20" v-if="state.ruleForm.id == null">
						<el-form-item label="用户账户" prop="userAccount">
							<el-input maxlength="20" v-model="state.ruleForm.userAccount" placeholder="请输入账户名称"
								clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="用户昵称" prop="nickName">
							<el-input maxlength="12" v-model="state.ruleForm.nickName" placeholder="请输入用户昵称"
								clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="手机号" prop="mobile">
							<el-input type="number" maxlength="11" v-model="state.ruleForm.mobile" placeholder="请输入手机号"
								clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20" v-if="state.ruleForm.id == null">
						<el-form-item label="密码" prop="password">
							<el-input maxlength="20" minlength="6" v-model="state.ruleForm.password" placeholder="请输入密码"
								clearable></el-input>
						</el-form-item>
					</el-col>

					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="关联用户组">
							<el-tree ref="treeRef" style="max-width: 600px" :data="state.userGroupArr" show-checkbox
								node-key="id" default-expand-all highlight-current
								:default-checked-keys="state.ruleForm.userGroupIds" :props="defaultProps" />
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

<script setup lang="ts" name="systemUserDialog">
import { reactive, ref, nextTick } from 'vue';
import service from '/@/utils/request';
import { type FormInstance, type ElTree, ElMessage } from 'element-plus'
import { Md5 } from 'ts-md5';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const userDialogFormRef = ref<FormInstance>();
const treeRef = ref<InstanceType<typeof ElTree>>()

const validatePass = (rule: any, value: any, callback: any) => {
	if (value == '' && (state.ruleForm.id == null || !state.ruleForm.id)) {
		callback(new Error('请输入密码'))
	} else {
		callback()
	}
}

const rules = reactive({
	userAccount: [{ required: true, message: '请输入完整', trigger: 'blur' }],
	nickName: [{ required: true, message: '请输入完整', trigger: 'blur' }],
	password: [{ validator: validatePass, trigger: 'blur' }],
})

const defaultProps = {
	label: 'groupName',
}

const state = reactive({
	ruleForm: {
		id: null,
		userAccount: "",
		nickName: "",
		mobile: "",
		password: "",
		userGroupIds: []
	},
	userGroupArr: [],
	dialog: {
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
	},
});

// 打开弹窗
const openDialog = (type: string, row: any) => {
	getUserGroupData();
	nextTick(() => {
		userDialogFormRef.value?.resetFields();
	})
	if (type === 'edit') {
		getDetail(row.id)
		state.dialog.title = '修改用户';
		state.dialog.submitTxt = '修 改';
	} else {
		state.ruleForm.id = null;
		state.ruleForm.password = '';
		state.dialog.title = '新增用户';
		state.dialog.submitTxt = '新 增';
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
	let dat = JSON.parse(JSON.stringify(state.ruleForm));
	dat.userGroupIds = treeRef.value!.getCheckedKeys() as any;
	if (dat.id == null) {
		const md5: any = new Md5()
		md5.appendAsciiStr(dat.password)
		dat.password = md5.end()
	}

	userDialogFormRef.value!.validate((valid: any) => {
		if (valid) {
			//请求接口
			service.request({
				method: "post",
				url: state.ruleForm.id == null ? "/sys/user/register" : "/sys/user/update",
				data: dat
			}).then(() => {
				closeDialog(); // 关闭弹窗
				emit('refresh');
			}).catch(e=>{
				ElMessage.error(e)
			})
		}
	})
};
// 初始化用户组数据
const getUserGroupData = () => {
	service.request({
		method: "get",
		url: "/sys/user-group/list",
		params: {
			current: 1,
			size: -1
		}
	}).then(res => {
		state.userGroupArr = res.data.rows;
	})
};

const getDetail = (id: any) => {
	service.request({
		method: "get",
		url: "/sys/user/get",
		params: {
			id
		}
	}).then(res => {
		let dat = res.data;
		// dat.resIds = dat.resourceItems.map((v: any) => v.id);
		state.ruleForm = dat;
		nextTick(() => {
			treeRef.value?.setCheckedKeys(state.ruleForm.userGroupIds);
		})
	})
}

// 暴露变量
defineExpose({
	openDialog,
});
</script>
