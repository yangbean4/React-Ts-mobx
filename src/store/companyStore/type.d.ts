import { CompanyStore as CompanyStoreModel } from './index'

export as namespace ICompanyStore

export interface CompanyStore extends CompanyStoreModel { }

export interface ICompany {
    id?: number
    company?: string
    fullName?: string
    caddress?: string
    email?: string
    phone?: string
    beneName?: string
    accountNumber?: number
    swiftCode?: number
    baddress?: number
}
export interface SearchParams {
    company?: string
}