export interface CustomGroup {
    id: number;
    name: string;
    title: string;
    extends: string;
    table_name: string;
    help_pre?: string;
    help_post?: string;
    is_reserved: boolean;
    is_public: boolean;
    option_group_id?: number;
}
