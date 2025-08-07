export interface Contribution {
  length?: number;
  id: number;
  contact_id: number;
  "contact.display_name"?: string;
  financial_type_id: number;
  "financial_type_id:label"?: string;
  payment_instrument_id: number;
  "payment_instrument_id:label"?: string;
  receive_date: string;
  total_amount: number;
  "currency:abbr"?: string;
  source?: string;
  contribution_status_id: number;
  "contribution_status_id:label"?:string;
}

export interface ContributionPayload {
  contact_id: number;
  financial_type_id: number;
  "financial_type_id:label"?: string;
  payment_instrument_id: number;
  "payment_instrument_id:label"?: string;
  receive_date: string;
  total_amount: number;
  "currency:abbr"?: string;
  source?: string;
  contribution_status_id: number;
}



