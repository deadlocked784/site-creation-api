import type { DonorCountByRecurringStatus, MonthlySummary, TopContribution, YearlyComparison, YearlyDonationsByType, DonationPaymentMethodCount, DonationAmountByCampaign, ContributionsByTdrNtdr } from "@/types/dashboard";
import type { Contribution } from "@/types/contribution";

import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;


export function countDonorsByRecurringStatus(year: number): Promise<DonorCountByRecurringStatus> {
  return axios
    .get(`${BASE_URL}/api/dashboard/countDonorsByRecurringStatus`, {
      params: { year },
    })
    .then(res => res.data.data);
}


export function getCompletedContribution(): Promise<Contribution[]> {
  return axios.get(`${BASE_URL}/api/dashboard/getCompletedContribution`).then(res => res.data.data);
}

export function getDonationCountByPaymentMethod(year: number): Promise<DonationPaymentMethodCount[]> {
  return axios
    .get(`${BASE_URL}/api/dashboard/donationCountByPaymentMethod`, {
      params: { year },
    })
    .then(res => res.data.data);
}

export function getDonationAmtByCampaign(year: number): Promise<DonationAmountByCampaign[]> {
  return axios
    .get(`${BASE_URL}/api/dashboard/donationAmtByCampaign`, {
      params: { year },
    }).then(res => res.data.data);
}

export function saveTargetAmount(amount: number): Promise<number> {
  return axios
    .post(`${BASE_URL}/api/dashboard/targetAmount`, { amount })
    .then(res => res.data.data);
}

export function getTargetAmount(): Promise<number> {
  return axios
    .get(`${BASE_URL}/api/dashboard/targetAmount`).then(res => res.data.data);
}


export function countContributionsByTdrNtdr(year: number): Promise<ContributionsByTdrNtdr> {
  return axios
    .get(`${BASE_URL}/api/dashboard/countContributionsByTdrNtdr`, {
      params: { year },
    })
    .then(res => res.data.data);
}


export function getYearlyComparisonSummary(): Promise<YearlyComparison> {
  return axios.get(`${BASE_URL}/api/dashboard/yearly-comparison`)
    .then(res => res.data);
}

/**
 * Fetch counts of contacts by type.
 * GET /api/dashboard/summary
 */
export function getContactTypeCounts(): Promise<{ individual: number; organization: number }> {
  return axios
    .get(`${BASE_URL}/api/dashboard/summary`)
    .then(res => {
      const data = res.data.data;
      return {
        individual: data.Individual || 0,
        organization: data.Organization || 0
      };
    });
}


/**
 * Fetch top 5 contributors based on contact_type (e.g., "Individual" or "Organization").
 * 
 * @param contactType - The contact type to filter by ("Individual" or "Organization").
 * @returns A promise resolving to an array of TopContribution.
 */
// export function getTopContribution(contactType: "Individual" | "Organization"): Promise<TopContribution[]> {

export async function getTopContribution(contactType: "Individual" | "Organization"): Promise<TopContribution[]> {
  try {
    const res = await axios.get(`${BASE_URL}/api/dashboard/top-contributors`, {
      params: { contact_type: contactType },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching top contributions:", error);
    throw error;
  }
}



export function getYearlyDonationsByType(): Promise<YearlyDonationsByType[]> {
  return axios.get(`${BASE_URL}/api/dashboard/yearly-comparison`)
    .then(res => res.data)
}

export function getMonthlyContributionSummary(): Promise<MonthlySummary[]> {
  return axios.get(`${BASE_URL}/api/dashboard?summary=monthly`)
    .then(res => res.data.data);
}
