/*
 * @Description:
 * @Author:  bean^ <bean_4@163.com>
 * @Date: 2019-10-24 09:57:29
 * @LastEditors:  bean^ <bean_4@163.com>
 * @LastEditTime: 2019-12-03 11:26:00
 */
declare interface IStore {
  offerQueryStore: IOfferQueryStore.OfferQueryStore
  revenueStore: IRevenueStore.RevenueStore
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
  permissionStore: IPermissionStore.PermissionStore
  customStore: ICustomStore.CustomStore
  templateStore: ITemplateStore.TemplatesStore
  configStore: IConfigStore.ConfigStore
  leadContentStore: ILeadContentStore.LeadContentStore
  taskStore: ITaskStore.TaskStore
  sceneStore: ISceneStore.SceneStore
  categoryConfigStore: ICategoryConfigStore.categoryConfigStore
  whiteBlackListStore: IWhiteBlackListStore.WhiteBlackListStore
  h5ExportStore: IH5ExportStore.H5ExportStore,
  manualEcpmStore: IManualEcpmStore.manualEcpmStore,
  budgetStore: IBudgetGroupStore.budgetStore
  topCreativeStore: ITopCreativeStore.topCreativeStore
  creativeFrequencyStore: ICreativeFrequencyStore.CreativeFrequencyStore
  iosWhiteListStore: IIosWhiteListStore.IosWhiteListStore
  chartStore: IChartStore.ChartStore
  maskStore: IMaskSubsiteStore.MaskSubsiteStore
  StrategyGroupStore: IStrategyGroupStore.StrategyGroupStore
}
