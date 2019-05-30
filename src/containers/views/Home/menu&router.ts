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
export const menu: IMenu[] = [
    {
        id: 1,
        title: 'Config',
        icon: 'iconconfigpeizhi',
        authName: 'Config Manage'
    },
    {
        pid: 1,
        id: 11,
        title: 'Config Manage',
        path: '/config',
        component: 'Config',
        exact: true,
        authName: 'Config Manage-Config Manage'
    },
    {
        pid: 1,
        id: templateId,
        title: 'Template Manage',
        hasBread: false,
        // icon: 'iconmobanguanli',
        authName: 'Config Manage-Template Manage'
    },
    {
        id: 20,
        pid: 2,
        component: 'Custom',
        title: 'Custom Templates',
        path: '/custom'
    },
    // {
    //     id: 21,
    //     pid: 2,
    //     title: 'Player',
    //     path: '/player',
    //     component: 'Config',
    // },
    // {
    //     id: 22,
    //     pid: 2,
    //     title: 'Playicon Template',
    // },
    // {
    //     id: 23,
    //     pid: 2,
    //     title: 'Appwall Coins',
    // },
    // {
    //     id: 24,
    //     pid: 2,
    //     title: 'Privacy',
    // },

    {
        id: 3,
        title: 'Authorization',
        icon: 'iconjiaoseshezhi',
        authName: 'Authorization',
    },
    {
        id: 31,
        pid: 3,
        path: '/users',
        title: 'User Manage',
        component: 'Users',
        exact: true,
        authName: 'Authorization-User Manage'
    },
    {
        id: 32,
        pid: 3,
        path: '/role',
        title: 'Roles Manage',
        component: 'Role',
        exact: true,
        authName: 'Authorization-Role Manage'
    },
    {
        id: 33,
        pid: 3,
        path: '/permission',
        title: 'Permission Manage',
        component: 'Permission',
        exact: true,
        authName: "Authorization-Permission Mamage"
    },
    {
        id: 4,
        title: 'Log',
        icon: 'iconlog',
        exact: true,
        authName: 'Log'
    },
    {
        id: 41,
        pid: 4,
        title: 'Config',
        hasBread: false,
        // path: '/log-config',
        // component: 'Logs',
    },
    {
        id: 42,
        pid: 4,
        hasBread: false,
        title: 'Authorization',
        // path: '/log-auth',
        // component: 'Logs',
    },
    {
        id: 5,
        title: 'Apps',
        icon: 'iconlog',
        authName: 'Apps'
    },
    // {
    //     pid:5,
    //     id: 51,
    //     title: 'Company',
    //     path: '/Company',
    //     icon: 'iconlog',
    //     authName: 'Apps-Company',
    //     component: 'Company',
    //     exact: true,
    // },
    {
        id: 6,
        title: 'Company',
        icon: 'iconlog',
        authName: 'Company'
    },
    {
        pid:6,
        id: 61,
        title: 'Subsite Company',
        path: '/Subsite',
        icon: 'iconlog',
        authName: 'Company-Subsite Company',
        component: 'CompanySite',
        exact: true,
    },
    {
        pid:6,
        id: 62,
        title: 'Source Company',
        path: '/Source',
        icon: 'iconlog',
        authName: 'Company-Subsite Company',
        component: 'CompanySite',
        exact: true,
    },
    {
        id: 7,
        title: 'Account',
        icon: 'iconlog',
        authName: 'Account'
    },
    {
        id: 8,
        title: 'Offers',
        icon: 'iconlog',
        authName: 'Offers'       
    },
]
export const logMenu: IMenu[] = [{
    id: 411,
    pid: 41,
    path: '/log/config',
    title: 'Config Manage',
    component: 'Logs',
},
{
    id: logId,
    pid: 41,
    title: 'Template Manage',
    hasBread: false,
    component: 'Logs',
},
{
    id: 413,
    pid: logId,
    path: '/log/template',
    title: 'Custom Templates',
    component: 'Logs',
},
{
    id: 421,
    pid: 42,
    path: '/log/user',
    title: 'User Manage',
    component: 'Logs',
},
{
    id: 422,
    pid: 42,
    path: '/log/role',
    title: 'Roles Manage',
    component: 'Logs',
}]

const menuMap: IRouter[] = [...menu].map(ele => {
    return {
        ...ele,
        isMenu: true
    }
})


const addRouter: IRouter[] = [
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
        id: 3302,
        path: '/template/:id',
        title: '',
        component: 'Template',
        isMenu: false
    },
    {
        id: 4002,
        path: '/log/:id',
        title: '',
        component: 'Logs',
        isMenu: false
    },
    {
        id: 4003,
        path: '/test',
        title: 'ggg',
        component: 'Test',
        isMenu: false
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
]

export const router: IRouter[] = [...menuMap, ...addRouter]
export default menu
