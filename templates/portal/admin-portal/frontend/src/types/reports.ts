export interface Report {
  id: number;
  domain_id: number;
  title: string;
  report_id: string;
  name: string;
  description: string;
  permission: string;
  grouprole: string;
  is_active: boolean;
  created_id: number;
  is_reserved: boolean;
  navigation_id: number;
  form_values?: ReportFormValues;
};


export interface ReportFormValues {
  fields?: Record<string, string>; 
  [key: string]: any; 
}


export interface StatRow {
  id: string;
  [key: string]: string | number | null | undefined;
};