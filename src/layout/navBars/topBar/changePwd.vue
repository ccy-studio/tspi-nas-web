<template>
    <div class="system-role-dialog-container">
        <el-dialog title="修改密码" v-model="state.dialog.isShowDialog" width="769px">
            <el-form :rules="rules" ref="dialogFormRef" :model="state.ruleForm" size="default" label-width="90px">
                <el-row :gutter="35">
                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
                        <el-form-item label="原密码" prop="oldPwd">
                            <el-input v-model="state.ruleForm.oldPwd" placeholder="请输入原始密码" clearable></el-input>
                        </el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
                        <el-form-item label="新密码" prop="newPwd">
                            <el-input v-model="state.ruleForm.newPwd" placeholder="请输入新密码" clearable></el-input>
                        </el-form-item>
                    </el-col>

                    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
                        <el-form-item label="再次输入" prop="newPwd2">
                            <el-input v-model="state.ruleForm.newPwd2" placeholder="请在此输入新密码" clearable></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="onCancel" size="default">取 消</el-button>
                    <el-button type="primary" @click="onSubmit" size="default">提 交</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="systemRoleDialog">
import { reactive, ref, nextTick } from 'vue';
import service from '/@/utils/request';
import { ElMessage, type FormInstance } from 'element-plus'
import { Md5 } from 'ts-md5';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['relogin']);

// 定义变量内容
const dialogFormRef = ref<FormInstance>();

const rules = reactive({
    oldPwd: [{ required: true, message: '请输入完整', trigger: 'blur' }],
    newPwd: [{ required: true, message: '请输入完整', trigger: 'blur' }],
    newPwd2: [{ required: true, message: '请输入完整', trigger: 'blur' }],
})


const state = reactive({
    ruleForm: {
        oldPwd: '',
        newPwd: '',
        newPwd2: ''
    },
    dialog: {
        isShowDialog: false,
        type: '',
        title: '',
        submitTxt: '',
    },
});

// 打开弹窗
const openDialog = () => {
    nextTick(() => {
        dialogFormRef.value?.resetFields();
    })
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
    if (state.ruleForm.newPwd !== state.ruleForm.newPwd2) {
        ElMessage.error("两次密码输入不一致,请重新输入!")
        return;
    }
    dialogFormRef.value!.validate((valid: any) => {
        if (valid) {
            let dat = {
                newPwd: '',
                oldPwd: ''
            };
            dat.oldPwd = Md5.hashStr(state.ruleForm.oldPwd);
            dat.newPwd = Md5.hashStr(state.ruleForm.newPwd);
            //请求接口
            service.request({
                method: "post",
                url: "/sys/user/change-pwd",
                data: dat
            }).then(() => {
                closeDialog(); // 关闭弹窗
                emit('relogin');
            }).catch(err => {
                ElMessage.error(err)
            })
        }
    })
};

// 暴露变量
defineExpose({
    openDialog,
});
</script>

<style scoped lang="scss"></style>
