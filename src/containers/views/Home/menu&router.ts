import Loadable from 'react-loadable'

import PageLoading from '@components/PageLoading'

const loadComponent = (loader: () => Promise<any>) =>
    Loadable({
        loader,
        loading: PageLoading
    })

export const asynchronousComponents = {
    Config: loadComponent(() => import(/* webpackChunkName: "Config" */ '@views/Config')),
    CompanySite: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/Company')),
    Account: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/Account')),
    Apps: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/AppsGroup/Apps')),
    CompanyModel: loadComponent(() => import(/* webpackChunkName: "CompanyModel" */ '@views/Company/CompanyModel')),
    Logs: loadComponent(() => import(/* webpackChunkName: "Logs" */ '@views/Log')),
    Users: loadComponent(() => import(/* webpackChunkName: "Users" */ '@views/Users')),
    Role: loadComponent(() => import(/* webpackChunkName: "Role" */ '@views/Role')),
    Permission: loadComponent(() => import(/* webpackChunkName: "Permission" */ '@views/Permission')),
    Template: loadComponent(() => import(/* webpackChunkName: "Template" */ '@views/Template')),
    Custom: loadComponent(() => import(/* webpackChunkName: "Custom" */ '@views/Custom')),
    ConfigModel: loadComponent(() => import(/* webpackChunkName: "Config" */ '@views/Config/ConfigModal')),
    UserModal: loadComponent(() => import(/* webpackChunkName: "UserModal" */ '@views/Users/UserModal')),
    RoleModal: loadComponent(() => import(/* webpackChunkName: "RoleModal" */ '@views/Role/RoleModal')),
    PermissionModal: loadComponent(() => import(/* webpackChunkName: "PermissionModal" */ '@views/Permission/PermissionModal')),
    Test: loadComponent(() => import(/* webpackChunkName: "Test" */ '@views/Test/useEffrct.js')),
}

// 所有路由的key
export type AsynchronousComponentKeys = keyof typeof asynchronousComponents

export interface IMenu {
    title: string
    id: number
    pid?: number
    path?: string
    icon?: string
    component?: AsynchronousComponentKeys
    exact?: boolean
    authName?: string
    hasBread?: boolean
}

export interface IMenuInTree extends IMenu {
    children?: IMenuInTree[]
}

export interface IRouter extends IMenu {
    isMenu?: boolean
}
export const templateId = 2
export const logId = 412
export const routerAndMenu: IRouter[] = [
    {
        id: 5,
        isMenu: true,
        title: 'Apps',
        icon: 'iconlog',
        authName: 'Apps'
    },
    {
        id: 6,
        isMenu: true,
        title: 'Company',
        icon: 'iconlog',
        authName: 'Company'
    },
    {
        pid: 6,
        isMenu: true,
        id: 61,
        title: 'Subsite Company',
        path: '/Subsite',
        icon: 'iconlog',
        authName: 'Company-Subsite Company',
        component: 'CompanySite',
        exact: true,
    },
    {
        pid: 6,
        isMenu: true,
        id: 62,
        title: 'Source Company',
        path: '/Source',
        icon: 'iconlog',
        authName: 'Company-Subsite Company',
        component: 'CompanySite',
        exact: true,
    },
    {
        id: 5101,
        pid: 51,
        path: '/Company/add',
        title: 'Add company',
        component: 'CompanyModel',
        isMenu: false
    },
    {
        id: 5102,
        pid: 51,
        path: '/Subsite/edit/:id',
        title: 'Edit company',
        component: 'CompanyModel',
        isMenu: false,
    },
    {
        id: 7,
        isMenu: true,
        title: 'Account',
        icon: 'iconlog',
        authName: 'Account'
    },
    {
        id: 8,
        isMenu: true,
        title: 'Offers',
        icon: 'iconlog',
        authName: 'Offers'
    },
    // ----------------------------------------
    {
        id: 1,
        title: 'Config',
        icon: 'iconconfigpeizhi',
        authName: 'Config Manage',
        isMenu: true
    },
    {
        pid: 1,
        id: 11,
        title: 'Config Manage',
        path: '/config',
        component: 'Config',
        exact: true,
        isMenu: true,
        authName: 'Config Manage-Config Manage'
    },
    {
        id: 10000,
        pid: 11,
        path: '/config/edit/:id',
        title: 'Edit Config',
        component: 'ConfigModel',
        isMenu: false
    },
    {
        id: 10000,
        pid: 11,
        path: '/config/add',
        title: 'Add Config',
        component: 'ConfigModel',
        isMenu: false
    },
    {
        pid: 1,
        id: templateId,
        title: 'Template Manage',
        hasBread: false,
        isMenu: true,
        authName: 'Config Manage-Template Manage'
    },
    {
        id: 20,
        pid: 2,
        isMenu: true,
        component: 'Custom',
        title: 'Custom Templates',
        path: '/custom'
    },
    {
        id: 3302,
        path: '/template/:id',
        title: '',
        component: 'Template',
        isMenu: false
    },
    {
        id: 3,
        isMenu: true,
        title: 'Authorization',
        icon: 'iconjiaoseshezhi',
        authName: 'Authorization',
    },
    {
        id: 31,
        pid: 3,
        isMenu: true,
        path: '/users',
        title: 'User Manage',
        component: 'Users',
        exact: true,
        authName: 'Authorization-User Manage'
    },
    {
        id: 3101,
        pid: 31,
        path: '/users/add',
        title: 'Add User',
        component: 'UserModal',
        isMenu: false
    },
    {
        id: 3102,
        pid: 31,
        path: '/users/edit/:id',
        title: 'Edit User',
        component: 'UserModal',
        isMenu: false
    },
    {
        id: 32,
        pid: 3,
        isMenu: true,
        path: '/role',
        title: 'Roles Manage',
        component: 'Role',
        exact: true,
        authName: 'Authorization-Role Manage'
    },
    {
        id: 3201,
        pid: 32,
        path: '/role/add',
        title: 'Add Role',
        component: 'RoleModal',
        isMenu: false
    },
    {
        id: 3202,
        pid: 32,
        path: '/role/edit/:id',
        title: 'Edit Role',
        component: 'RoleModal',
        isMenu: false
    },
    {
        id: 33,
        pid: 3,
        isMenu: true,
        path: '/permission',
        title: 'Permission Manage',
        component: 'Permission',
        exact: true,
        authName: "Authorization-Permission Mamage"
    },
    {
        id: 3301,
        pid: 33,
        path: '/permission/add',
        title: 'Add Permission',
        component: 'PermissionModal',
        isMenu: false
    },
    {
        id: 3302,
        pid: 33,
        path: '/permission/edit/:id',
        title: 'Edit Permission',
        component: 'PermissionModal',
        isMenu: false
    },
    {
        id: 4,
        isMenu: true,
        title: 'Log',
        icon: 'iconlog',
        exact: true,
        authName: 'Log'
    },
    {
        id: 4002,
        path: '/log/:id',
        title: '',
        component: 'Logs',
        isMenu: false
    },
    {
        id: 41,
        pid: 4,
        isMenu: true,
        title: 'Config',
        hasBread: false,
    },
    {
        id: 42,
        pid: 4,
        isMenu: true,
        hasBread: false,
        title: 'Authorization',
    },

    {
        id: 411,
        pid: 41,
        isMenu: true,
        path: '/log/config',
        title: 'Config Manage',
        component: 'Logs',
    },
    {
        id: logId,
        pid: 41,
        isMenu: true,
        title: 'Template Manage',
        hasBread: false,
        component: 'Logs',
    },
    {
        id: 413,
        pid: logId,
        isMenu: true,
        path: '/log/template',
        title: 'Custom Templates',
        component: 'Logs',
    },
    {
        id: 421,
        pid: 42,
        isMenu: true,
        path: '/log/user',
        title: 'User Manage',
        component: 'Logs',
    },
    {
        id: 422,
        pid: 42,
        isMenu: true,
        path: '/log/role',
        title: 'Roles Manage',
        component: 'Logs',
    },
    {
        id: 4003,
        path: '/test',
        title: 'ggg',
        component: 'Test',
        isMenu: false
    },
]

export const router = routerAndMenu.filter(ele => !!ele.path)
const menu = routerAndMenu.filter(ele => !!ele.isMenu)

export default menu
