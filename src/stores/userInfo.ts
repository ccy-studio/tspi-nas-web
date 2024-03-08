import { defineStore } from 'pinia';
import service from '/@/utils/request';

/**
 * 用户信息
 * @methods setUserInfos 设置用户信息
 */
export const useUserInfo = defineStore('userInfo', {
	state: (): UserInfosState => ({
		userInfos: {
			roles: [],
			authBtnList: [],
			accessKey: '',
			id: 0,
			mobile: '',
			nickName: "",
			userAccount: "",
			time: 0,
			photo: ''
		},
	}),
	actions: {
		async setUserInfos() {
			this.userInfos = <UserInfos>await this.getApiUserInfo();
		},
		async getApiUserInfo() {
			return new Promise((resolve) => {
				service.request({
					method: "get",
					url: "/sys/current-user"
				}).then(res => {
					let dat = res.data;
					const userName = dat.userAccount;
					// 模拟数据
					let defaultRoles: Array<string> = [];
					let defaultAuthBtnList: Array<string> = [];
					// admin 页面权限标识，对应路由 meta.roles，用于控制路由的显示/隐藏
					let adminRoles: Array<string> = ['admin'];
					// admin 按钮权限标识
					let adminAuthBtnList: Array<string> = ['btn.add', 'btn.del', 'btn.edit', 'btn.link'];
					// test 页面权限标识，对应路由 meta.roles，用于控制路由的显示/隐藏
					let testRoles: Array<string> = ['common'];
					// test 按钮权限标识
					let testAuthBtnList: Array<string> = ['btn.add', 'btn.link'];
					// 不同用户模拟不同的用户权限
					if (userName === 'admin') {
						defaultRoles = adminRoles;
						defaultAuthBtnList = adminAuthBtnList;
					} else {
						defaultRoles = testRoles;
						defaultAuthBtnList = testAuthBtnList;
					}
					// 用户信息模拟数据
					const userInfos = {
						accessKey: dat.accessKey,
						id: dat.id,
						mobile: dat.mobile,
						nickName: dat.nickName,
						userAccount: dat.userAccount,
						photo:
							userName === 'admin'
								? 'https://img2.baidu.com/it/u=1978192862,2048448374&fm=253&fmt=auto&app=138&f=JPEG?w=504&h=500'
								: 'https://img2.baidu.com/it/u=2370931438,70387529&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
						time: new Date().getTime(),
						roles: defaultRoles,
						authBtnList: defaultAuthBtnList,
					};
					resolve(userInfos);
				})
			});
		},
	},
});
