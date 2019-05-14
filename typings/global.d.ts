declare var process: {
    env: {
        NODE_ENV: string
        APP_ENV: string
        BASEURL: string
    }
}

declare interface PlainObject {
    [propName: string]: any
}

declare interface BooleanObject {
    [propName: string]: boolean
}

declare interface StringObject {
    [propName: string]: string
}

declare interface NumberObject {
    [propName: string]: number
}

interface operate {
    edit?: number | boolean
    delete?: number | boolean
}

declare interface TemplateConfig {
    search_filed?: object
    list_filed?: {
        operate?: operate
    }
    add_filed?: {
        version?: string | number
        template_md5?: string | number
    }
}