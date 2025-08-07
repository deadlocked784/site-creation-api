export interface IrasTransaction {
  id: number;
  receipt_no: string;
  receive_date: string;
  total_amount: number;
  contact_id: number;
  sort_name: string;
  nricuen: string;
  donation_created_date: string;
  sent_method: string;
  sent_response: string;
  response_body: string;
  "currency:abbr"?: string;
}


export interface IrasConfiguration {
    validate_only: boolean;
    organisation_name: string;
    authorised_person_id: number;
    authorised_person_name: string;
    authorised_person_designation: string;
    authorised_person_phone: string;
    authorised_person_email: string;
    prefix: string;
    min_amount: number;

}

export interface GenerateReportPayload {
  selected_ids: string;
  start_date?: string;
  end_date?: string;
  include_previous?: boolean;
  ammendment?: boolean;
}

export interface GenerateReportResponse {
  message: string;
}



