/*
 * @Description: 
 * @Author:  bean^ <bean_4@163.com>
 * @Date: 2019-10-08 12:00:35
 * @LastEditors:  bean^ <bean_4@163.com>
 * @LastEditTime: 2019-10-08 16:12:22
 */
export interface Placement {
  platform: 'ios' | 'android'
  placement_id: string
  placement_name: string
}
export interface Campaign {
  platform: 'ios' | 'android'
  campaign_id: string | number
  campaign_name: string
}
export interface PlacementCampaign {
  placement_id: string
  type: 0 | 1
  campaign_id: Array<string | number>
}