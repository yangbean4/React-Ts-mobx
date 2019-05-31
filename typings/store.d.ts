declare interface IStore {
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
}