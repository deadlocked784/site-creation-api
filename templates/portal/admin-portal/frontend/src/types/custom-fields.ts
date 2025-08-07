export interface CustomField {
    id: number;
    name: string;
    label: string;
    data_type: string;
    html_type: string;
    default_value?: string;
    is_required: boolean;
    help_pre?: string;
    help_post?: string;
    is_view: boolean;
    option_group_id?: number;
    time_format?: string;
    fk_entity?: string;
    filter?: string;
}
