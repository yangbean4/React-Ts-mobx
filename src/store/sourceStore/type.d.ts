import { SourceStore as SourceStoreModel } from './index'

export as namespace ISourceStore

export interface SourceStore extends SourceStoreModel { }

export interface ISource {
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
    SourceCompany?: string
}