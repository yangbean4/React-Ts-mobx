/*
 * @Description: 
 * @Author:  bean^ <bean_4@163.com>
 * @Date: 2019-04-24 11:17:34
 * @LastEditors  :  bean^ <bean_4@163.com>
 * @LastEditTime : 2020-02-06 16:50:59
 */
import { UserStore as UserStoreModel } from './index'

export as namespace IUserStore

export interface UserStore extends UserStoreModel { }

export interface IUser {
    id?: number
    owner?: string
    role?: string
    status?: 0 | 1
    user_name?: string
    pwd?: string
    name?: string
    department?: String | number
}
export interface SearchParams {
    user_name?: string,
    owner?: string,
    status?: string | number
    department?: String | number
}