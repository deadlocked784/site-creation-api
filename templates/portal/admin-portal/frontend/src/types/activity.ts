export interface Activity {
    id: number;
    "activity_type_id": string;
    "source_contact_id": string;
    "target_contact_id"?: string;
    "assignee_contact_id"?: string;
    "activity_type_id:name": string
    "source.display_name"?: string;
    "target.display_name"?: string;
    "assignee.display_name"?: string;
    subject?: string;
    location?: string;
    activity_date_time: Date;
    duration?: string;
    "status_id:name": string;
    status_id: number;
    details?: string;
    "Pending_Contribution.Total_Amount": number;
}