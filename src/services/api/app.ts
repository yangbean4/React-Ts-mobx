
import http from '@services/http'
const basePath = '/api/app/'
export default {
  getAppGroup(data): Promise<any> {
    return http.post(`${basePath}appList`, data || {})
  },

  createAppGroup(data): Promise<any> {
    return http.post(`${basePath}addApp`, data || {})
  },

  modifyAppGroup(data): Promise<any> {
    return http.post(`${basePath}editApp`, data || {})
  },

  // deleteAppGroup(data): Promise<any> {
  //   return http.post(`${basePath}delAppGroup`, data || {})
  // },

  // fullAppGroup(): Promise<any> {
  //   return http.post(`${basePath}appList`)
  // },

  getAppGroupInfo(data): Promise<any> {
    return http.post(`${basePath}appDetail`, data)
  },

  // ----待选项
  getCategory(): Promise<any> {
    return http.post(`${basePath}category`)
  },

  getFrame(): Promise<any> {
    return http.post(`${basePath}frame`)
  },

  getSpec(): Promise<any> {
    return http.post(`${basePath}spec`)
  },

  getStyle(): Promise<any> {
    return http.post(`${basePath}style`)
  },

  getAccount(): Promise<any> {
    return http.post(`api/account/account`)
  },
  getAccountSource(): Promise<any> {
    return http.post(`api/account/account1`)
  },
  getPidType(): Promise<any> {
    return http.post(`${basePath}pidType`)
  },
  getVC(data): Promise<any> {
    return http.post(`${basePath}virtualCurrency`, data)
  },
  getAppWall(): Promise<any> {
    return http.post(`${basePath}appWall`)
  },
  getCountry(): Promise<any> {
    return http.post(`${basePath}country`)
  },
  // -----

  uploadIcon(data): Promise<any> {
    return http.post(`/api/upload/uploadIcon`, data || {})
  },

  // ---------------Placement
  addPalcement(data): Promise<any> {
    return http.post(`${basePath}addPlacement`, data)
  },
  palcementDetail(data): Promise<any> {
    return http.post(`${basePath}placementDetail`, data)
  },
  editPlacement(data): Promise<any> {
    return http.post(`${basePath}editPlacement`, data)
  },
  placementList(data): Promise<any> {
    return http.post(`${basePath}placementList`, data)
  },

  getPkgnameData(): Promise<any> {
    return http.post(`${basePath}pkgnameData`)
  },

}
