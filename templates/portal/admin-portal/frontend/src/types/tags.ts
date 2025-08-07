export interface Tag {
  id: number;
  name: string;
  label: string;
  description: string;
  parent_id: number | null;
  is_selectable: boolean;
  is_reserved: boolean;
  is_tagset: boolean;
  used_for: string[];
  created_id: number | null;
  color: string;
  created_date: string;
}
