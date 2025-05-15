export interface SystemConfigurationModel {
  id?: number;
  name: string;
  value: string;
  category: string;
  custom_data?: any;
  user_id?: number | null;
}
