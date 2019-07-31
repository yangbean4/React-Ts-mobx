import { CompanyStore as CompanyStoreModel } from './index'

export as namespace ICompanyStore

export interface CompanyStore extends CompanyStoreModel { }

export interface ICompany {
    id?: number
    company_name?: string
    company_full_name?: string
    address?: string
    phone?: string
    email?: string
    beneficiary_name?: string
    bank_account_number ?: string
    bank_swift_code?: string
    bank_address?: string
}
export interface SearchParams {
    company?: string
}