export interface conItem {
  default?: any
  id?: number
  sort?: number
  key?: string
  value_type?: string
  unit?: string
  addId?: string
  option?: any
  template_pid?: number
  templateId?: number
  isEdit?: boolean | undefined
  value?: any
  pid_type?: number
}

export interface conItemTreeItem extends conItem {
  children?: conItemTreeItem[]
}

export type conItemTree = conItemTreeItem[]