import type { Contribution } from "./contribution";

export interface DonorCountByRecurringStatus {
  recurring: number
  oneTime: number
  recurringData: Contribution[]
  oneTimeData: Contribution[]
}

export interface DonationPaymentMethodCount {
  method: string;
  count: number;
  donors: Contribution[];
}


export interface DonationAmountByCampaign {
  campaign: string;
  total: number;
  donors: Contribution[];
}


export interface ContributionsByTdrNtdr {
  deductible: number;
  non_deductible: number;
  deductibleData: Contribution[];
  non_deductibleData: Contribution[];
}



export const CardIds = {
  totalContribution: "totalContribution",
  newDonorByMonth: "newDonorByMonth",
  getIndividual: "getIndividual",
  getOrganization: "getOrganization",
  getPieChart: "getPieChart",
  getBarChart: "getBarChart",
  recentContributionsTable: "recentContributionsTable",
  quickAction: "quickAction",
  monthlySummary: "monthlySummary",
  yearlyDonationChange: "yearlyDonationChange",
  donationAmtByCampaign: "donationAmtByCampaign",
  donationByPaymentMethod: "donationByPaymentMethod",
  contributionsTdrNtdrChart: "contributionsTdrNtdrChart",
  targetDonationAmount: "TargetDonationAmount",
  topIndividualDonorTable: "topIndividualDonorTable",
  topOrganisationDonorTable: "topOrganisationDonorTable",
  pendingContributionsTable: "pendingContributionsTable",
  
} as const;

export type CardId = keyof typeof CardIds;

export interface YearlyComparison {
  current_year: string;
  previous_year: string;
  current_total: number;
  previous_total: number;
  percentage_change: number; // Can be positive or negative
}


export interface TopContribution {
  contact_id: number;
  "contact.display_name": string;
  "contact.contact_type": string;
  source: string | null; // if your backend returns null sometimes
  total_donated: number;
  latest_donation_date: string;
}

// export interface YearlyDonationsByType {
//   year: string;         
//   Individual: number;    
//   Organization: number;  
// }
export type YearlyDonationsByType = {
  year: string;
  Individual: number;
  Organization: number;
  contributions?: Contribution[]; // ✅ Add this
};

export interface MonthlySummary {
  month: string;
  total: number;
  count: number;
}