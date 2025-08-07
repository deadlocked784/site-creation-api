export interface Group {
  id: number;
  name: string;
  title: string;
  description: string;
  source: string;
  saved_search_id: number;
  is_active: boolean;
  visibility: string;
  where_clause: string | null;
  select_tables: string | null;
  where_tables: string | null;
  group_type: string[]; 
};
