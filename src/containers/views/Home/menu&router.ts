/*
 * @Description:
 * @Author:  bean^ <bean_4@163.com>
 * @Date: 2019-10-17 14:26:29
 * @LastEditors:  bean^ <bean_4@163.com>
 * @LastEditTime: 2019-12-03 11:24:32
 */

import Loadable from 'react-loadable'

import PageLoading from '@components/PageLoading'

const loadComponent = (loader: () => Promise<any>) =>
  Loadable({
    loader,
    loading: PageLoading
  })

export const asynchronousComponents = {
  OfferQuery: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/OfferQuery')),

  Revenue: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/Revenue')),
  // ------------------Apps Manage
  AppManages: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/AppMange')),
  AppManagesModel: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/AppMange/AppMangeModal')),
  //  ------------------ Manual eCPM
  Manual: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/ManualEcpm')),
  ManualAdd: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/ManualEcpm/ManualModel')),
  ManualEdit: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/ManualEcpm/ManualModel')),
  // ------------------Budget Group
  Budget: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/BudgetGroup')),
  BudgetAdd: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/BudgetGroup/BudgetGroupModel')),
  BudgetEdit: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/BudgetGroup/BudgetGroupModel')),

  //------------------Compaigns
  Campaigns: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/Campaigns')),
  CampaignsAdd: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/Campaigns/CampaignsModel/Add')),
  CampaignsEdit: loadComponent(() => import(/* webpackChunkName: "CompanySite" */ '@views/Campaigns/CampaignsModel/Add')),
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
  // endcardTemplate: loadComponent(() => import(/* webpackChunkName: "EndcardEdit" */ '@views/EndcardTemplate')),
  Mask: loadComponent(() => import(/* webpackChunkName: "Mask" */ '@views/Mask')),

  Creative: loadComponent(() => import(/* webpackChunkName: "Creative" */ '@views/Creative')),
  CreativeAdd: loadComponent(() => import(/* webpackChunkName: "CreativeAdd" */ '@views/Creative/CreativeModal/Add')),
  CreativeEdit: loadComponent(() => import(/* webpackChunkName: "CreativeEdit" */ '@views/Creative/CreativeModal/Edit')),
  //
  LeadContent: loadComponent(() => import(/* webpackChunkName: "LeadContent" */ '@views/LeadContent')),
  LeadContentAdd: loadComponent(() => import(/* webpackChunkName: "LeadContentAdd" */ '@views/LeadContent/LeadContentModal/Add')),
  LeadContentEdit: loadComponent(() => import(/* webpackChunkName: "CreativeEdit" */ '@views/LeadContent/LeadContentModal/Edit')),
  // Category Config
  Scene: loadComponent(() => import(/* webpackChunkName: "Users" */ '@views/Scene')),
  SceneModal: loadComponent(() => import(/* webpackChunkName: "UserModal" */ '@views/Scene/SceneModal')),

  // Task List
  Task: loadComponent(() => import(/* webpackChunkName: "Task" */ '@views/Task')),
  TaskModal: loadComponent(() => import(/* webpackChunkName: "TaskModal" */ '@views/Task/TaskModal')),
  ViewSceneImage: loadComponent(() => import(/* webpackChunkName: "TaskModal" */ '@views/Task/ViewSceneImage')),

  Category: loadComponent(() => import(/* webpackChunkName: "Users" */ '@views/CreateAnalysis/CategoryConfig')),
  CategoryModal: loadComponent(() => import(/* webpackChunkName: "UserModal" */ '@views/CreateAnalysis/CategoryConfig/CategoryModel')),

  // white/black list
  WhiteBlackList: loadComponent(() => import(/* webpackChunkName: "WhileBlackList" */ '@views/WhiteBlackList')),
  WhiteBlackModal: loadComponent(() => import(/* webpackChunkName: "WhiteBlackAdd" */ '@views/WhiteBlackList/WhiteBlackModal')),
  // H5 Export
  H5ExportList: loadComponent(() => import(/* webpackChunkName: "H5Exportlist" */ '@views/H5Export')),
  H5ExportModal: loadComponent(() => import(/* webpackChunkName: "H5ExportAdd" */ '@views/H5Export/H5ExportModal')),

  // Top Creatives
  TopCreatives: loadComponent(() => import(/* webpackChunkName: "TopCreativeskList" */ '@views/TopCreatives')),

  // Creative Frequency
  CreativeFrequency: loadComponent(() => import(/* webpackChunkName: "CreativeFrequencyList" */ '@views/CreativeFrequency')),
  CreativeFrequencyModal: loadComponent(() => import(/* webpackChunkName: "CreativeFrequencyAdd" */ '@views/CreativeFrequency/CreativeFrequencyModal')),

  // IOS Whitelist
  IosWhiteList: loadComponent(() => import(/* webpackChunkName: "IosWhitelist" */ '@views/IosWhiteList')),
  IosWhiteListEdit: loadComponent(() => import(/* webpackChunkName: "IosWhitelistEdit" */ '@views/IosWhiteList/IosWhiteListModal/Edit')),

  // Bubble Chart
  BubbleChart: loadComponent(() => import(/* webpackChunkName: "BubbleChart" */ '@views/Chart/bubbleChart')),

  // Strategy Group
  StrategyGroup: loadComponent(() => import(/* webpackChunkName: "BubbleChart" */ '@views/StrategyGroup')),
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
  isRoot?: boolean
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
    icon: 'iconfenlei-weixuanzhong',
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
  {
    id: 53,
    pid: 5,
    isMenu: true,
    exact: true,
    path: '/whiteBlackList',
    title: 'White/Black List',
    component: 'WhiteBlackList',
    authName: 'Apps-White/Black list'
  },
  {
    id: 531,
    pid: 53,
    isMenu: false,
    path: '/whiteBlackList/add',
    title: 'Add White/Black',
    component: 'WhiteBlackModal',
  },
  {
    id: 532,
    pid: 53,
    isMenu: false,
    path: '/whiteBlackList/edit/:id',
    title: 'Edit White/Black',
    component: 'WhiteBlackModal',
  },
  {
    id: 54,
    pid: 5,
    isMenu: true,
    exact: true,
    path: '/creativeFrequency',
    title: 'Creative Frequency',
    component: 'CreativeFrequency',
    authName: 'Apps-Creative Frequency'
  },
  {
    id: 541,
    pid: 54,
    isMenu: false,
    path: '/creativeFrequency/add',
    title: 'Add Creative Frequency',
    component: 'CreativeFrequencyModal',
  },
  {
    id: 542,
    pid: 54,
    isMenu: false,
    path: '/creativeFrequency/edit/:id',
    title: 'Edit Creative Frequency',
    component: 'CreativeFrequencyModal',
  },
  {
    id: 55,
    pid: 5,
    isMenu: true,
    exact: true,
    path: '/StrategyGroup',
    title: 'Strategy Group',
    component: 'StrategyGroup',
    authName: 'Apps-Strategy Group'
  },
  // --------Offer-----------
  {
    id: 8,
    isMenu: true,
    title: 'Offers',
    icon: 'icondingdan',
    authName: 'Offers'
  },
  {
    id: 86,
    pid: 8,
    isMenu: true,
    exact: true,
    title: 'Offer Query',
    authName: 'Offers-Offer Query',
    component: 'OfferQuery',
    path: '/query'
  },
  {
    id: 87,
    pid: 8,
    isMenu: true,
    exact: true,
    title: 'H5 Export',
    authName: 'Offers-H5 Export',
    component: 'H5ExportList',
    path: '/h5Export'
  },
  {
    id: 871,
    pid: 87,
    isMenu: false,
    path: '/h5Export/add',
    title: 'Add H5 Export ',
    component: 'H5ExportModal',
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
    id: 811,
    pid: 81,
    isMenu: false,
    path: '/offer/add',
    title: 'Add App ',
    component: 'AppManagesModel',
  },
  {
    id: 812,
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
  // {
  //   id: 83,
  //   pid: 8,
  //   isMenu: true,
  //   exact: true,
  //   title: 'Endcard',
  // },
  {
    id: 831,
    pid: 8,
    isMenu: true,
    exact: true,
    title: 'Endcard',
    authName: 'Offers-Endcard',
    component: 'Endcard',
    path: '/endcard'
  },

  // {
  //   id: 832,
  //   pid: 83,
  //   isMenu: true,
  //   exact: true,
  //   title: 'Endcard Template',
  //   authName: 'Offers-Endcards-Endcard Template',
  //   component: 'endcardTemplate',
  //   path: '/endcardTemplate'
  // },
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
    title: 'Campaigns',
    isMenu: true,
    hasBread: false,
  },


  {
    id: 851,
    pid: 85,
    isMenu: true,
    exact: true,
    title: 'Campaigns',
    authName: 'Offers-Campaigns-Campaigns',
    component: 'Campaigns',
    path: '/campaigns'
  },
  {
    id: 8551,
    pid: 851,
    isMenu: false,
    path: '/campaigns/add',
    title: 'Add Campaign ',
    component: 'CampaignsAdd',
  },
  {
    id: 8552,
    pid: 851,
    isMenu: false,
    path: '/campaigns/edit/:id',
    title: 'Edit Campaign',
    component: 'CampaignsEdit',
  },
  {
    id: 852,
    pid: 85,
    isMenu: true,
    exact: true,
    title: 'Manual eCPM',
    authName: 'Offers-Campaigns-Manual eCPM',
    component: 'Manual',
    path: '/manual'
  },
  {
    id: 8521,
    pid: 852,
    isMenu: false,
    title: 'Add',
    component: 'ManualAdd',
    path: '/manual/add'
  },
  {
    id: 8522,
    pid: 852,
    isMenu: false,
    title: 'Edit',
    component: 'ManualAdd',
    path: '/manual/edit/:id'
  },
  {
    id: 858,
    pid: 85,
    isMenu: true,
    exact: true,
    title: 'Budget Group',
    authName: 'Offers-Campaigns-Budget Group',
    component: 'Budget',
    path: '/budget'
  },
  {
    id: 8581,
    pid: 858,
    isMenu: false,
    title: 'Add',
    component: 'BudgetAdd',
    path: '/budget/add'
  },
  {
    id: 8582,
    pid: 858,
    isMenu: false,
    title: 'Edit',
    component: 'BudgetAdd',
    path: '/budget/edit/:id'
  },

  {
    id: 88,
    pid: 8,
    title: 'Mask Subsite',
    isMenu: true,
    hasBread: false,
    exact: true,
    authName: 'Offers-Mask Subsite',
    component: 'Mask',
    path: '/mask'
  },
  // --------Company---------------
  {
    id: 6,
    isMenu: true,
    title: 'Company',
    icon: 'icongongsi',
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
    icon: 'iconqianbao',
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
  // ----------------config------------------------
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
    pid: 1,
    id: 13,
    title: 'IOS Whitelist',
    path: '/iosWhitelist',
    component: 'IosWhiteList',
    exact: true,
    isMenu: true,
    authName: 'Config Manage-IOS Whitelist'
  },
  {
    pid: 13,
    id: 131,
    title: 'Edit IOS Whitelist',
    path: '/iosWhitelist/edit/:bundle_id',
    component: 'IosWhiteListEdit',
  },
  //----------------Revenue Import
  {
    id: 9,
    isMenu: true,
    path: '/revenue',
    title: 'Revenue Import',
    component: 'Revenue',
    icon: 'iconmethod-draw-image',
    isRoot: true,
    authName: 'Revenue Import',
  },

  // ----------------------------------------------Creative Analysis
  {
    id: 10,
    isMenu: true,
    title: 'Creative Analysis',
    icon: 'iconfenxi1',
    authName: 'Creative Analysis',
  },
  // Category Config
  {
    id: 101,
    pid: 10,
    isMenu: true,
    path: '/category',
    title: 'Category Config',
    component: 'Category',
    exact: true,
    authName: 'Creative Analysis-Category Config'
  },
  {
    id: 1011,
    pid: 101,
    path: '/category/add',
    title: 'Add',
    component: 'CategoryModal',
    isMenu: false
  },
  {
    id: 1012,
    pid: 101,
    path: '/category/edit/:id',
    title: 'Edit Category',
    component: 'CategoryModal',
    isMenu: false
  },
  // Scene Config
  {
    id: 102,
    pid: 10,
    isMenu: true,
    path: '/scene',
    title: 'Scene Config',
    component: 'Scene',
    exact: true,
    authName: 'Creative Analysis-Scene Config'
  },
  {
    id: 1021,
    pid: 102,
    path: '/scene/add',
    title: 'Add Scene',
    component: 'SceneModal',
    isMenu: false
  },
  {
    id: 1022,
    pid: 102,
    path: '/scene/edit/:id',
    title: 'Edit Scene',
    component: 'SceneModal',
    isMenu: false
  },
  // Task List
  {
    id: 103,
    pid: 10,
    isMenu: true,
    path: '/task',
    title: 'Task List',
    component: 'Task',
    exact: true,
    authName: 'Creative Analysis-Task List'
  },
  {
    id: 1031,
    pid: 103,
    path: '/task/add',
    title: 'Add Task',
    component: 'TaskModal',
    isMenu: false
  },
  {
    id: 1032,
    pid: 103,
    path: '/task/edit/:id',
    title: 'Edit Task',
    component: 'TaskModal',
    isMenu: false
  },
  {
    id: 1033,
    pid: 103,
    path: '/task/sceneImage',
    title: 'View Scene Image',
    component: 'ViewSceneImage',
    isMenu: false
  },
  // ----------------------------------------------Creative Analysis
  {
    id: 12,
    isMenu: true,
    path: '/topCreatives',
    title: 'Top Creatives',
    component: 'TopCreatives',
    icon: 'iconpaihangbang',
    isRoot: true,
    authName: 'Top Creatives',
  },
  // Bubble Chart
  {
    id: 14,
    isMenu: true,
    path: '/BubbleChart',
    title: 'Bubble Chart',
    component: 'BubbleChart',
    icon: 'iconqipaotu',
    isRoot: true,
    // authName: 'Bubble Chart',
  },
  // {
  //     id: 91,
  //     pid: 9,
  //     isMenu: true,
  //     path: '/revenue',
  //     component: 'Revenue',
  //     title: 'Revenue Import',
  //     exact: true,
  //     authName: 'Revenue Import-Revenue Import',
  // },
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
  // {
  //   id: 4002,
  //   path: '/log/:id',
  //   title: '',
  //   component: 'Logs',
  //   isMenu: false
  // },
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
    component: 'Logs',
  },
  {
    id: 486,
    pid: 48,
    isMenu: true,
    title: 'H5 Export',
    path: '/log/sen_h5',
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
  // {
  //   id: 4832,
  //   pid: 483,
  //   isMenu: true,
  //   title: 'Endcard Template',
  //   path: '/log/endcard_template',
  //   // authName: 'Offers-Endcards-Endcard Template',
  //   component: 'Logs'
  // },

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
    hasBread: false,
    title: 'Campaigns',
  },
  {
    id: 4851,
    pid: 485,
    isMenu: true,
    title: 'Campaigns',
    path: '/log/Campaigns',
    // authName: 'Offers-Comments-Comment Templates',
    component: 'Logs'
  },
  {
    id: 4852,
    pid: 485,
    isMenu: true,
    title: 'Manual eCMP',
    path: '/log/data_offer_ecpm_raise',
    // authName: 'Offers-Comments-Comment Templates',
    component: 'Logs'
  },
  {
    id: 4853,
    pid: 485,
    isMenu: true,
    title: 'Budget Group',
    path: '/log/budget_group',
    // authName: 'Offers-Comments-Comment Templates',
    component: 'Logs'
  },

  // path: '/log/campaigns',
  // authName: 'Offers-Campaigns',
  // component: 'Logs'
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
    id: 413,
    pid: 41,
    isMenu: true,
    path: '/log/white_black',
    title: 'White/Black List',
    component: 'Logs',
    exact: true,
    // authName: 'Apps-Virtual Currency'
  },
  {
    id: 414,
    pid: 41,
    isMenu: true,
    path: '/log/creativefrequency',
    title: 'Creative Frequency',
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
    id: 443,
    pid: 44,
    isMenu: true,
    path: '/log/ios_whiteList',
    title: 'IOS WhiteList',
    component: 'Logs',
  },
  {
    id: 451,
    pid: logId,
    isMenu: true,
    path: '/log/template',
    title: 'User Manage',
    component: 'Logs',
    // authName: 'Config Manage-Template Manage'
  },
  {
    id: 49,
    pid: 4,
    isMenu: true,
    path: '/log/revenue',
    component: 'Logs',
    title: 'Revenue Import',
  },
  {
    id: 410,
    pid: 4,
    isMenu: true,
    component: 'Logs',
    title: 'Creative Analysis',
  },
  {
    id: 4101,
    pid: 410,
    isMenu: true,
    component: 'Logs',
    path: '/log/categoryConfig',
    title: 'Category Config',
  },
  {
    id: 4102,
    pid: 410,
    isMenu: true,
    component: 'Logs',
    path: '/log/scene_config',
    title: 'Scene Config',
  },
  {
    id: 4103,
    pid: 410,
    isMenu: true,
    component: 'Logs',
    path: '/log/task',
    title: 'Task List',
  },
  // {
  //     id: 491,
  //     pid: 49,
  //     isMenu: true,
  //     path: '/log/revenue',
  //     title: 'Revenue Import',
  //     component: 'Logs',
  //     // authName: 'Authorization-User Manage'
  // },
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
