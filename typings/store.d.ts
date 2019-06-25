declare interface IStore {
    appManageStore: IAppManageStore.AppManageStore
    creativeStore: ICreativeStore.CreativeStore
    campaignStore: ICampaignStore.CampaignStore
    commentGroupStore: ICommentGroupStore.CommentGroupStore
    endcardStore: IEndcardStore.EndcardStore
    endcardTemplateStore: IEndcardTemplateStore.EndcardTemplateStore
    commentStore: ICommentStore.CommentStore
    appGroupStore: IAppGroupStore.AppGroupStore
    accountStore: ICurrencyStore.AccountStore
    currencyStore: ICurrencyStore.CurrencyStore
    authStore: IAuthStore.AuthStore
    userStore: IUserStore.UserStore
    companyStore: ICompanyStore.CompanyStore
    roleStore: IRoleStore.RoleStore
    globalStore: IGlobalStore.GlobalStore
    routerStore: RouterStore,
    logsStore: ILogsStore.LogsStore,
    permissionStore: IPermissionStore.PermissionStore,
    customStore: ICustomStore.CustomStore
    templateStore: ITemplateStore.TemplatesStore
    configStore: IConfigStore.ConfigStore
    leadContentStore: ILeadContentStore.LeadContentStore
}