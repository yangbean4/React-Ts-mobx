## 时间安排
1. 脚手架搭建、公用方法封装等 ---------2 bean:2
2. 头部+左侧+路由搭建配置+登录/退出/修改密码 ----- 3 bean:1 bao:1
3. 权限配置搭建-----0.5 bean:0.5
4. Authorization模块---1.5 bao:1.5
5. Log模块 ----------- 1  bao 1
6. Template Manage 模块 5*0.6= 3 bao:3
7. Config Manage模块 
    basic1 + basic2 = 6 bean:5 bao:1
    POP+PID 1.5 bao:1.5
8. 优化调试 1
9. 联调




===================
baen_@163.com
123456
--------------------------------------
## config部分前端结构
```
[
  {
  key:'State', 
  value:'1',
  type:'number | string | url | color ',
  require:'', //是否必填
  company:'seconds',
  companyList:['seconds','year']
  },{
    key:'__adsad_',
    value:'0|1',
    label:'Init Switch Type',
    type:'radio|checkbox',//单选|多选
    require:'' //是否必填
    options:[
      {label:"yes",value:'1'},
      {label:"no",value:'0'}
    ]
  },
  {
    key:"Privacy Text",
    value:"",
    type:'select',
    options:[
      {label:"zhang",value:'0'},
      {label:"wang",value:'1'},
      {label:"liz",value:'2'},
      {label:"zhao",value:'3'}
    ]
  },
  {
    key:"Privacy Text",
    value:"",
    type:'select',
    templateType:'play'
  },
]
```

```
name as the id

add new Template Class 1 => update menu + auth => menu update 
                         => add layer submit => [list].item use addUrl to save , ?get id, use id replace name
                         => save to option :{}
                         => join the Template page => get the Template config 1
1:{
  pageUrl:'index.php/template/abc/page',
  selectUrl:'index.php/template/abc/all',
  addUrl:'index.php/template/abc/add',
  sourceMap:[
    {
      label:'Template Name',
      key:'name'
    }
    .....
  ],
  search:['name'],
  view:['name'],
  add:['name','Template']
}

```