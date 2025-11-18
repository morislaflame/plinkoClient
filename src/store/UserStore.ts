import {makeAutoObservable, runInAction } from "mobx";
import { fetchMyInfo, telegramAuth, check, quickLogin } from "../http/userAPI";
import type { UserInfo } from "../types/types";

export default class UserStore {
    _user: UserInfo | null = null;
    _isAuth = false;
    _users: UserInfo[] = [];
    _loading = false;
    isTooManyRequests = false;
    isServerError = false;
    serverErrorMessage = '';

    constructor() {
        makeAutoObservable(this);
    }

    setIsAuth(bool: boolean) {
        this._isAuth = bool;
    }

    setUser(user: UserInfo | null) {
        this._user = user;
    }

    setUsers(users: UserInfo[]) {
        this._users = users;
    }

    setLoading(loading: boolean) {
        this._loading = loading;
    }

    setTooManyRequests(flag: boolean) {
        this.isTooManyRequests = flag;
    }

    setServerError(flag: boolean, message: string = '') {
        this.isServerError = flag;
        this.serverErrorMessage = message;
    }

    async logout() {
        try {
            this.setIsAuth(false);
            this.setUser(null);
        } catch (error) {
            console.error("Error during logout:", error);
        }
    }

    async telegramLogin(initData: string) {
        try {
            const data = await telegramAuth(initData);
            runInAction(() => {
                this.setUser(data as UserInfo);
                this.setIsAuth(true);
                this.setServerError(false);
                this.fetchMyInfo();
            });
        } catch (error) {
            console.error("Error during Telegram authentication:", error);
            this.setServerError(true, 'Server is not responding. Please try again later.');
        }
    }

    async quickLogin(username: string) {
        try {
            this.setLoading(true);
            const data = await quickLogin(username);
            runInAction(() => {
                this.setUser(data as UserInfo);
                this.setIsAuth(true);
                this.setServerError(false);
                this.setLoading(false);
                this.fetchMyInfo();
            });
        } catch (error: any) {
            console.error("Error during quick login:", error);
            runInAction(() => {
                this.setLoading(false);
                const errorMessage = error?.response?.data?.message || 'Failed to login. Please try again.';
                this.setServerError(true, errorMessage);
            });
        }
    }
    
    async checkAuth() {
        try {
            const data = await check();
            runInAction(() => {
                this.setUser(data as UserInfo);
                this.setIsAuth(true);
                this.setServerError(false);
                this.fetchMyInfo();
            });
        } catch (error: any) {
            // Если ошибка 401 (Unauthorized) - это нормально, пользователь просто не авторизован
            if (error?.response?.status === 401) {
                runInAction(() => {
                    this.setIsAuth(false);
                    this.setUser(null);
                    this.setServerError(false);
                });
            } else {
                // Другие ошибки - это реальные проблемы с сервером
                console.error("Error during auth check:", error);
                runInAction(() => {
                    this.setIsAuth(false);
                    this.setUser(null);
                    this.setServerError(true, 'Server is not responding. Please try again later.');
                });
            }
        }
    }

    async fetchMyInfo() {
        try {
            this.setLoading(true);
            const data = await fetchMyInfo();
            runInAction(() => {
                this.setUser(data as UserInfo);
                this.setLoading(false);
                this.setServerError(false);
            });
            
        } catch (error: any) {
            // Если ошибка 401 (Unauthorized) - это нормально, пользователь просто не авторизован
            if (error?.response?.status === 401) {
                runInAction(() => {
                    this.setLoading(false);
                    this.setServerError(false);
                });
            } else {
                console.error("Error during fetching my info:", error);
                runInAction(() => {
                    this.setLoading(false);
                    this.setServerError(true, 'Failed to fetch user info');
                });
            }
        }
    }

    // Метод для обновления баланса без полной перезагрузки пользователя
    updateBalance(newBalance: number) {
        if (this._user) {
            this._user.balance = newBalance;
        }
    }
    
    get users() {
        return this._users;
    }

    get isAuth() {
        return this._isAuth
    }

    get user() {
        return this._user
    }

    get loading() {
        return this._loading;
    }
}
