import Loadable from 'react-loadable'

import PageLoading from '@components/PageLoading'

const loadComponent = (loader: () => Promise<any>) =>
    Loadable({
        loader,
        loading: PageLoading
    })

export const asynchronousComponents = {
    //------------------Apps Manage
    AppManages: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/AppMange')),
    AppManagesModel: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/AppMange/AppMangeModal')),
    //------------------Compaigns
    Campaigns: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/Campaigns')),
    CampaignsAdd: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/Campaigns/CampaignsModel/Add')),
    CampaignsEdit: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/Campaigns/CampaignsModel/Edit')),
    //------------------Comments
    CommentsTpl: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/Comments/Template')),
    CommentTplModel: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/Comments/Template/CommentModel')),
    CommentGroup: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/Comments/Groups')),
    CommentGroupModel: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/Comments/Groups/CommentModel')),
    //------------------Apps
    Apps: loadComponent(() => import(/* webpackChunkName: "Apps" */ '@views/AppGroup')),
    AppsModel: loadComponent(() => import(/* webpackChunkName: "AppsModel" */ '@views/AppGroup/AppGroupModal')),

    Currency: loadComponent(() => import(/* webpackChunkName: "Currency" */ '@views/Currency')),
    CurrencyAdd: loadComponent(() => import(/* webpackChunkName: "CurrencyAdd" */ '@views/Currency/CurrencyModal/Add')),
    CurrencyEdit: loadComponent(() => import(/* webpackChunkName: "CurrencyEdit" */ '@views/Currency/CurrencyModal/Edit')),

    Account: loadComponent(() => import(/* webpackChunkName: "Account" */ '@views/Account')),
    AccountModel: loadComponent(() => import(/* webpackChunkName: "AccountModel" */ '@views/Account/AccountModel')),

    CompanySite: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/Companysite')),
    CompanySource: loadComponent(() => import(/* webpackChunkName: "CompanySource" */ '@views/Companysource')),
    CompanyModel: loadComponent(() => import(/* webpackChunkName: "CompanyModel" */ '@views/Companysite/CompanyModel')),
    CompanysourceModel: loadComponent(() => import(/* webpackChunkName: "CompanysourceModel" */ '@views/Companysource/AdsourceModel')),

    Config: loadComponent(() => import(/* webpackChunkName: "Config" */ '@views/Config')),
    ConfigModel: loadComponent(() => import(/* webpackChunkName: "ConfigModel" */ '@views/Config/ConfigModal')),

    Users: loadComponent(() => import(/* webpackChunkName: "Users" */ '@views/Users')),
    UserModal: loadComponent(() => import(/* webpackChunkName: "UserModal" */ '@views/Users/UserModal')),

    Role: loadComponent(() => import(/* webpackChunkName: "Role" */ '@views/Role')),
    RoleModal: loadComponent(() => import(/* webpackChunkName: "RoleModal" */ '@views/Role/RoleModal')),

    Permission: loadComponent(() => import(/* webpackChunkName: "Permission" */ '@views/Permission')),
    PermissionModal: loadComponent(() => import(/* webpackChunkName: "PermissionModal" */ '@views/Permission/PermissionModal')),

    Custom: loadComponent(() => import(/* webpackChunkName: "Custom" */ '@views/Custom')),
    Template: loadComponent(() => import(/* webpackChunkName: "Template" */ '@views/Template')),

    Logs: loadComponent(() => import(/* webpackChunkName: "Logs" */ '@views/Log')),

    Test: loadComponent(() => import(/* webpackChunkName: "Test" */ '@views/Test/useEffrct.js')),

    Endcard: loadComponent(() => import(/* webpackChunkName: "Endcard" */ '@views/Endcard')),
    EndcardAdd: loadComponent(() => import(/* webpackChunkName: "EndcardAdd" */ '@views/Endcard/EndcardModal/Add')),
    EndcardEdit: loadComponent(() => import(/* webpackChunkName: "EndcardEdit" */ '@views/Endcard/EndcardModal/Edit')),
    endcardTemplate: loadComponent(() => import(/* webpackChunkName: "EndcardEdit" */ '@views/EndcardTemplate')),

    Creative: loadComponent(() => import(/* webpackChunkName: "Creative" */ '@views/Creative')),
    CreativeAdd: loadComponent(() => import(/* webpackChunkName: "CreativeAdd" */ '@views/Creative/CreativeModal/Add')),
    CreativeEdit: loadComponent(() => import(/* webpackChunkName: "CreativeEdit" */ '@views/Creative/CreativeModal/Edit')),
    // 
    LeadContent: loadComponent(() => import(/* webpackChunkName: "LeadContent" */ '@views/LeadContent')),
    LeadContentAdd: loadComponent(() => import(/* webpackChunkName: "LeadContentAdd" */ '@views/LeadContent/LeadContentModal/Add')),
    LeadContentEdit: loadComponent(() => import(/* webpackChunkName: "CreativeEdit" */ '@views/LeadContent/LeadContentModal/Edit'))
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
    breadcrumbRoot?: boolean
}

export interface IMenuInTree extends IMenu {
    children?: IMenuInTree[]
}

export interface IRouter extends IMenu {
    isMenu?: boolean
}
export const templateId = 2

export const logId = 442
export const routerAndMenu: IRouter[] = [
    // -------Apps-----------
    {
        id: 5,
        isMenu: true,
        title: 'Apps',
        icon: 'iconlog',
        authName: 'Apps'
    },
    {
        id: 51,
        pid: 5,
        isMenu: true,
        exact: true,
        title: 'Apps Manage',
        authName: 'Apps-Apps Manage',
        component: 'Apps',
        path: '/apps'
    },
    {
        id: 511,
        pid: 51,
        isMenu: false,
        path: '/apps/add',
        title: 'Add App',
        component: 'AppsModel',
    },
    {
        id: 511,
        pid: 51,
        isMenu: false,
        path: '/apps/edit/:id',
        title: 'Edit App',
        component: 'AppsModel',
    },
    {
        id: 52,
        pid: 5,
        isMenu: true,
        exact: true,
        path: '/currency',
        title: 'Virtual Currency',
        component: 'Currency',
        authName: 'Apps-Virtual Currency'
    },
    {
        id: 521,
        pid: 52,
        isMenu: false,
        path: '/currency/add',
        title: 'Add Virtual Currency',
        component: 'CurrencyAdd',
    },
    {
        id: 521,
        pid: 52,
        isMenu: false,
        // exact: true,
        path: '/currency/edit',
        title: 'Edit Virtual Currency',
        component: 'CurrencyEdit',
    },
    // --------Offer-----------
    {
        id: 8,
        isMenu: true,
        title: 'Offers',
        icon: 'iconlog',
        authName: 'Offers'
    },
    // ---------Apps manage--------------
    {
        id: 81,
        pid: 8,
        isMenu: true,
        exact: true,
        title: 'Apps Manage',
        authName: 'Offers-Apps Manage',
        component: 'AppManages',
        path: '/offer'
    },
    {
        id: 851,
        pid: 81,
        isMenu: false,
        path: '/offer/add',
        title: 'Add App ',
        component: 'AppManagesModel',
    },
    {
        id: 851,
        pid: 81,
        isMenu: false,
        path: '/offer/edit/:id',
        title: 'Edit App',
        component: 'AppManagesModel',
    },
    // creative
    {
        id: 82,
        pid: 8,
        isMenu: true,
        exact: true,
        title: 'Creatives',
    },
    {
        id: 821,
        pid: 82,
        isMenu: true,
        exact: true,
        title: 'Creatives',
        authName: 'Offers-Creatives-Creatives',
        component: 'Creative',
        path: '/creative'
    },
    {
        id: 8212,
        pid: 821,
        isMenu: false,
        path: '/creative/add',
        title: 'Add Creatives',
        component: 'CreativeAdd',
    },
    {
        id: 8211,
        pid: 821,
        isMenu: false,
        path: '/creative/edit/:id',
        title: 'Edit Creatives',
        component: 'CreativeEdit',
    },
    {
        id: 822,
        pid: 82,
        isMenu: true,
        exact: true,
        title: 'Lead Content',
        authName: 'Offers-Creatives-Lead Content',
        component: 'LeadContent',
        path: '/leadContent'
    },
    {
        id: 8222,
        pid: 822,
        isMenu: false,
        path: '/leadContent/add',
        title: 'Add Lead Content',
        component: 'LeadContentAdd',
    },
    {
        id: 8221,
        pid: 822,
        isMenu: false,
        path: '/leadContent/edit/:id',
        title: 'Edit Lead Content',
        component: 'LeadContentEdit',
    },
    // ------------------Endcard
    {
        id: 83,
        pid: 8,
        isMenu: true,
        exact: true,
        title: 'Endcard',
    },
    {
        id: 831,
        pid: 83,
        isMenu: true,
        exact: true,
        title: 'Endcard',
        authName: 'Offers-Endcard',
        component: 'Endcard',
        path: '/endcard'
    },

    {
        id: 832,
        pid: 83,
        isMenu: true,
        exact: true,
        title: 'Endcard Template',
        authName: 'Offers-Endcards-Endcard Template',
        component: 'endcardTemplate',
        path: '/endcardTemplate'
    },
    {
        id: 8312,
        pid: 831,
        isMenu: false,
        path: '/endcard/add',
        title: 'Add Endcard',
        component: 'EndcardAdd',
    },
    {
        id: 8311,
        pid: 831,
        isMenu: false,
        path: '/endcard/edit/:id',
        title: 'Edit Endcard',
        component: 'EndcardEdit',
    },
    // -------Comments--------
    {
        id: 84,
        pid: 8,
        isMenu: true,
        title: 'Comments',
        hasBread: false,
    },
    {
        id: 841,
        pid: 84,
        isMenu: true,
        authName: 'Offers-Comments-Comment Templates',
        title: 'Comment Template',
        component: 'CommentsTpl',
        path: '/comments/template',
        exact: true
    },
    {
        id: 8411,
        pid: 841,
        path: '/comments/template/add',
        title: 'Add Comment ',
        component: 'CommentTplModel',
        isMenu: false
    },
    {
        id: 8412,
        pid: 841,
        path: '/comments/template/edit/:id',
        title: 'Edit Comment ',
        component: 'CommentTplModel',
        isMenu: false
    },
    {
        id: 842,
        pid: 84,
        isMenu: true,
        authName: 'Offers-Comments-Comment Groups',
        title: 'Comment Groups',
        component: 'CommentGroup',
        path: '/comments/groups',
        exact: true
    },
    {
        id: 8421,
        pid: 842,
        path: '/comments/groups/add',
        title: 'Add Comment Group ',
        component: 'CommentGroupModel',
        isMenu: false
    },
    {
        id: 8421,
        pid: 842,
        path: '/comments/groups/edit/:id',
        title: 'Edit Comment ',
        component: 'CommentGroupModel',
        isMenu: false
    },
    // ---------Campaigns--------------
    {
        id: 85,
        pid: 8,
        isMenu: true,
        exact: true,
        title: 'Campaigns',
        authName: 'Offers-Campaigns',
        component: 'Campaigns',
        path: '/campaigns'
    },
    {
        id: 851,
        pid: 85,
        isMenu: false,
        path: '/campaigns/add',
        title: 'Add Campaign ',
        component: 'CampaignsAdd',
    },
    {
        id: 851,
        pid: 85,
        isMenu: false,
        path: '/campaigns/edit',
        title: 'Edit Campaign',
        component: 'CampaignsEdit',
    },
    // --------Company---------------
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
        path: '/companysite',
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
        path: '/companysource',
        icon: 'iconlog',
        authName: 'Company-Source Company',
        component: 'CompanySource',
        exact: true,
    },
    {
        id: 6201,
        pid: 62,
        path: '/companysource/add',
        title: 'Add Source Company',
        component: 'CompanysourceModel',
        isMenu: false
    },
    {
        id: 6202,
        pid: 62,
        path: '/companysource/edit/:id',
        title: 'Edit Source Company',
        component: 'CompanysourceModel',
        isMenu: false,
    },
    {
        id: 6101,
        pid: 61,
        path: '/companysite/add',
        title: 'Add Subsite Company',
        component: 'CompanyModel',
        isMenu: false
    },
    {
        id: 6102,
        pid: 61,
        path: '/companysite/edit/:id',
        title: 'Edit Subsite Company',
        component: 'CompanyModel',
        isMenu: false,
    },
    /************Account***************/
    {
        id: 7,
        isMenu: true,
        title: 'Account',
        icon: 'iconlog',
        authName: 'Account'
    },
    {
        pid: 7,
        isMenu: true,
        id: 71,
        title: 'Subsite Account',
        path: '/account/subsite',
        authName: 'Account-Subsite Account',
        component: 'Account',
        exact: true,
    },
    {
        id: 7101,
        pid: 71,
        path: '/account/subsite/add',
        title: 'Add Account',
        component: 'AccountModel',
        isMenu: false
    },
    {
        id: 7102,
        pid: 71,
        path: '/account/subsite/edit/:id',
        title: 'Edit Account',
        component: 'AccountModel',
        isMenu: false
    },
    {
        pid: 7,
        isMenu: true,
        id: 72,
        title: 'Source Account',
        path: '/account/source',
        authName: 'Account-Source Account',
        component: 'Account',
        exact: true,
    },
    {
        id: 7201,
        pid: 72,
        path: '/account/source/add',
        title: 'Add Account',
        component: 'AccountModel',
        isMenu: false
    },
    {
        id: 7202,
        pid: 72,
        path: '/account/source/edit/:id',
        title: 'Edit Account',
        component: 'AccountModel',
        isMenu: false
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
    /********log********** */
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
        hasBread: false,
        title: 'Apps',
    },
    {
        id: 48,
        pid: 4,
        isMenu: true,
        hasBread: false,
        title: 'Offers',
        exact: true,
    },
    {
        id: 481,
        pid: 48,
        isMenu: true,
        title: 'Apps Manage',
        path: '/log/appsManage',
        // authName: 'Apps-Apps Manage',
        component: 'Logs'
    },

    {
        id: 482,
        pid: 48,
        isMenu: true,
        hasBread: false,
        title: 'Creatives',
    },
    {
        id: 4821,
        pid: 482,
        isMenu: true,
        title: 'Creatives',
        path: '/log/creative',
        // authName: 'Offers-Creatives-Creatives',
        component: 'Logs'
    },
    {
        id: 4822,
        pid: 482,
        isMenu: true,
        title: 'Lead Content',
        path: '/log/lead_content',
        // authName: 'Offers-Creatives-Lead Content',
        component: 'Logs'
    },

    {
        id: 483,
        pid: 48,
        isMenu: true,
        hasBread: false,
        title: 'Endcard',
    },
    {
        id: 4831,
        pid: 483,
        isMenu: true,
        title: 'Endcard',
        path: '/log/endcard',
        // authName: 'Offers-Endcard',
        component: 'Logs'
    },
    {
        id: 4832,
        pid: 483,
        isMenu: true,
        title: 'Endcard Template',
        path: '/log/endcard_template',
        // authName: 'Offers-Endcards-Endcard Template',
        component: 'Logs'
    },

    {
        id: 484,
        pid: 48,
        isMenu: true,
        hasBread: false,
        title: 'Comments',
    },
    {
        id: 4841,
        pid: 484,
        isMenu: true,
        title: 'Comments',
        path: '/log/comment',
        // authName: 'Offers-Comments-Comment Templates',
        component: 'Logs'
    },
    {
        id: 4842,
        pid: 484,
        isMenu: true,
        title: 'Comment Groups',
        // authName: 'Offers-Comments-Comment Groups',
        path: '/log/comment_group',
        component: 'Logs'
    },
    {
        id: 485,
        pid: 48,
        isMenu: true,
        title: 'Campaigns',
        path: '/log/campaigns',
        // authName: 'Offers-Campaigns',
        component: 'Logs'
    },
    {
        id: 42,
        pid: 4,
        isMenu: true,
        hasBread: false,
        title: 'Company',
        path: '/log/company',
        exact: true,
        component: 'Logs'
    },
    {
        id: 43,
        pid: 4,
        isMenu: true,
        hasBread: false,
        title: 'Account',
        path: '/log/account',
        exact: true,
        component: 'Logs'
    },
    {
        id: 44,
        pid: 4,
        isMenu: true,
        title: 'Config',
        hasBread: false,
    },
    {
        id: 411,
        pid: 41,
        isMenu: true,
        title: 'Apps Manage',
        component: 'Logs',
    },
    {
        id: 4111,
        pid: 411,
        isMenu: true,
        path: '/log/app',
        title: 'App',
        component: 'Logs',
        // authName: 'Apps-Apps Manage',
    },
    {
        id: 4112,
        pid: 411,
        isMenu: true,
        path: '/log/placement',
        title: 'Placement',
        component: 'Logs',
        // authName: 'Apps-Apps Manage',
    },

    {
        id: 412,
        pid: 41,
        isMenu: true,
        path: '/log/virtual_currency',
        title: 'Virtual Currency',
        component: 'Logs',
        exact: true,
        // authName: 'Apps-Virtual Currency'

    },
    {
        id: 421,
        pid: 42,
        isMenu: true,
        path: '/log/companysubsite',
        title: 'Subsite Company',
        // authName: 'Company-Subsite Company',
        component: 'Logs',
    },
    {
        id: 422,
        pid: 42,
        isMenu: true,
        path: '/log/companysource',
        title: 'Source Company',
        component: 'Logs',
        // authName: 'Company-Source Company',
    },
    {
        id: 431,
        pid: 43,
        isMenu: true,
        path: '/log/accountsubsite',
        title: 'Subsite Account',
        component: 'Logs',
        // authName: 'Account-Subsite Account',
    },
    {
        id: 432,
        pid: 43,
        isMenu: true,
        path: '/log/accountsource',
        title: 'Source Account',
        component: 'Logs',
        // authName: 'Account-Source Account',
    },

    {
        id: 441,
        pid: 44,
        isMenu: true,
        path: '/log/config',
        title: 'Config Manage',
        component: 'Logs',
        // authName: 'Config Manage-Config Manage'
    },
    {
        id: logId,
        pid: 44,
        isMenu: true,
        title: 'Template Manage',
        hasBread: false,
        component: 'Logs',
        // authName: 'Config Manage-Template Manage'
    },
    {
        id: 451,
        pid: logId,
        isMenu: true,
        path: '/log/template',
        title: 'Custom Templates',
        component: 'Logs',
        // authName: 'Config Manage-Template Manage'
    },
    {
        id: 45,
        pid: 4,
        isMenu: true,
        hasBread: false,
        title: 'Authorization',
    },
    {
        id: 451,
        pid: 45,
        isMenu: true,
        path: '/log/user',
        title: 'User Manage',
        component: 'Logs',
        // authName: 'Authorization-User Manage'
    },
    {
        id: 452,
        pid: 45,
        isMenu: true,
        path: '/log/role',
        title: 'Roles Manage',
        // authName: 'Authorization-Role Manage',
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
