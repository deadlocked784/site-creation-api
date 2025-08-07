import { useMemo, useState, type FC, type JSX } from "react"; 
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw } from "lucide-react";
import SortableCard from "./components/sortable-card";
import RecurringOneTimeDonation from "./components/recurring-one-time-donor-chart";
import TotalContributionCard from "./components/total-contribution-card";
import TopDonorTable from "./components/top-donor-table";
import RecentContributionsTable from "./components/recent-contribution-table";
import MonthlyContributionsSummary from "./components/monthly-summary-barchart";
import QuickActionsDropdown from "./components/quick-action";
import YearlyDonationChangeWidget from "./components/percentage-change-difference";
import DonationByCampaign from "./components/donation-amt-by-campaign-chart";
import DonationByPaymentMethod from "./components/donation-payment-method-chart";
import ContributionsTdrNtdrChart from "./components/donation-tdr-ntdr-chart";
import TargetDonationAmount from "./components/target-contribution-amount";
import PendingContributionsTable from "./components/pendingContributionsCard/pending-contributions";
import StatsCard from "./components/stats-card";
import SkeletonCard from "./skeleton-card";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { getTopContribution } from "@/services/dashboard";
import type { CardId } from "@/types/dashboard";

interface CardItem {
  id: string;
  label: string;
  component: FC;
  size: "small" | "big";
  group: string;
}

const cardsData: CardItem[] = [
  { id: "totalContribution", label: "Total Contribution", component: TotalContributionCard, size: "small", group: "Stats" },
  { id: "getIndividual", label: "No of Individual Donors", component: () => <StatsCard title="No of Individual Donors" dataKey="individual" />, size: "small", group: "Stats" },
  { id: "getOrganization", label: "No of Organization Donors", component: () => <StatsCard title="No of Organization Donors" dataKey="organization" />, size: "small", group: "Stats" },
  { id: "targetDonationAmount", label: "Target Donation Amount", component: TargetDonationAmount, size: "big", group: "Stats" },
  { id: "monthlySummary", label: "Monthly Contributions Summary", component: MonthlyContributionsSummary, size: "big", group: "Charts" },
  { id: "getPieChart", label: "One-Time vs Recurring Donation", component: RecurringOneTimeDonation, size: "big", group: "Charts" },
  { id: "yearlyDonationChange", label: "Yearly Donation Change", component: YearlyDonationChangeWidget, size: "big", group: "Charts" },
  { id: "donationAmtByCampaign", label: "Donation by Campaign", component: DonationByCampaign, size: "big", group: "Charts" },
  { id: "donationByPaymentMethod", label: "Donation by Payment Method", component: DonationByPaymentMethod, size: "big", group: "Charts" },
  { id: "contributionsTdrNtdrChart", label: "Deductible vs Non-Deductible Donations", component: ContributionsTdrNtdrChart, size: "big", group: "Charts" },
  { id: "recentContributionsTable", label: "Recent Contributions", component: RecentContributionsTable, size: "big", group: "Tables" },
  { id: "topIndividualDonorTable", label: "Top Individual Donors", component: () => <TopDonorTable queryKey="topIndividualContribution" queryFn={() => getTopContribution("Individual")} title="Top Individual Donors" exportFileName="top-individual-donors" />, size: "big", group: "Tables" },
  { id: "topOrganisationDonorTable", label: "Top Organisation Donors", component: () => <TopDonorTable queryKey="topOrganisationContribution" queryFn={() => getTopContribution("Organization")} title="Top Organisation Donors" exportFileName="top-organisation-donors" />, size: "big", group: "Tables" },
  { id: "pendingContributionsTable", label: "Pending Contributions", component: PendingContributionsTable, size: "big", group: "Tables" },
];

const defaultCardOrder = cardsData.map((card) => card.id) as CardId[];

export default function HomePage(): JSX.Element {
  const sensors = useSensors(useSensor(PointerSensor));
  const [dashboardCards, setDashboardCards] = useState<CardId[]>(() => {
    const stored = localStorage.getItem("customDashboardOrder");
    return stored ? JSON.parse(stored) as CardId[] : defaultCardOrder;
  });
  const [loadingCards, setLoadingCards] = useState<CardId[]>([]);

  const toggleCardSize = (id: string) => {
    const card = cardsData.find((c) => c.id === id);
    if (!card) return;
    card.size = card.size === "big" ? "small" : "big";
    setDashboardCards([...dashboardCards]);
  };

  const cardsMap = useMemo(() => {
    const map: Record<string, FC> = {};
    cardsData.forEach((c) => (map[c.id] = c.component));
    return map;
  }, []);


  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = dashboardCards.indexOf(active.id as CardId);
    const newIndex = dashboardCards.indexOf(over.id as CardId);
    if (oldIndex !== newIndex) {
      setDashboardCards((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  const addCard = (id: string): void => {
    if (dashboardCards.includes(id as CardId)) return;
    setLoadingCards((prev) => [...prev, id as CardId]);
    setTimeout(() => {
      setDashboardCards((prev) => [...prev, id as CardId]);
      setLoadingCards((prev) => prev.filter((cardId) => cardId !== id));
    }, 300);
  };

  const removeCard = (id: string): void => {
    setDashboardCards((prev) => prev.filter((cardId) => cardId !== id));
  };

  const resetDashboard = (): void => {
    setDashboardCards(defaultCardOrder);
    localStorage.setItem("customDashboardOrder", JSON.stringify(defaultCardOrder));
  };

  const selectAllWidgets = () => {
    setDashboardCards(cardsData.map((c) => c.id) as CardId[]);
  };

  const hideAllWidgets = () => {
    setDashboardCards([]);
  };

  return (
    <div className="p-4 space-y-8">
      <div className="absolute top-4 right-4 z-50">
        <QuickActionsDropdown />
      </div>

      <section className="space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={resetDashboard} className="gap-1">
              <RefreshCcw className="w-4 h-4" /> Reset
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <Plus className="w-4 h-4" /> Manage Widgets
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Show/Hide Widgets</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={selectAllWidgets}>Select All</DropdownMenuItem>
                <DropdownMenuItem onSelect={hideAllWidgets}>Hide All</DropdownMenuItem>
                <DropdownMenuSeparator />
                {cardsData.map((card) => (
                  <DropdownMenuCheckboxItem
                    key={card.id}
                    checked={dashboardCards.includes(card.id as CardId)}
                    onCheckedChange={() =>
                      dashboardCards.includes(card.id as CardId)
                        ? removeCard(card.id)
                        : addCard(card.id)
                    }
                  >
                    {card.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl space-y-12">
        {dashboardCards.length === 0 && (
          <p className="text-gray-500">Add widgets from above to see them here</p>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {/* Stats Section */}
          <SortableContext
            items={dashboardCards.filter(id => cardsData.find(c => c.id === id)?.group === "Stats")}
            strategy={rectSortingStrategy}
          >
            <h3 className="text-lg font-semibold mb-4">Stats</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {dashboardCards
                .filter(id => cardsData.find(c => c.id === id)?.group === "Stats")
                .map(cardId => {
                  const Component = cardsMap[cardId];
                  const isLoading = loadingCards.includes(cardId);
                  return (
                    <div key={cardId} className="col-span-1">
                      <SortableCard
                        id={cardId}
                        onRemove={() => removeCard(cardId)}
                        onResize={() => toggleCardSize(cardId)}
                      >
                        {isLoading ? <SkeletonCard /> : <Component />}
                      </SortableCard>
                    </div>
                  );
                })}
            </div>
          </SortableContext>

          {/* Charts Section */}
          <SortableContext
            items={dashboardCards.filter(id => cardsData.find(c => c.id === id)?.group === "Charts")}
            strategy={rectSortingStrategy}
          >
            <h3 className="text-lg font-semibold mt-10 mb-4">Charts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dashboardCards
                .filter(id => cardsData.find(c => c.id === id)?.group === "Charts")
                .map(cardId => {
                  const Component = cardsMap[cardId];
                  const isLoading = loadingCards.includes(cardId);
                  return (
                    <div key={cardId} className="col-span-1">
                      <SortableCard
                        id={cardId}
                        onRemove={() => removeCard(cardId)}
                        onResize={() => toggleCardSize(cardId)}
                      >
                        {isLoading ? <SkeletonCard /> : <Component />}
                      </SortableCard>
                    </div>
                  );
                })}
            </div>
          </SortableContext>

          {/* Tables Section */}
          <SortableContext
            items={dashboardCards.filter(id => cardsData.find(c => c.id === id)?.group === "Tables")}
            strategy={rectSortingStrategy}
          >
            <h3 className="text-lg font-semibold mt-10 mb-4">Tables</h3>
            <div className="grid grid-cols-1 gap-2">
              {dashboardCards
                .filter(id => cardsData.find(c => c.id === id)?.group === "Tables")
                .map(cardId => {
                  const Component = cardsMap[cardId];
                  const isLoading = loadingCards.includes(cardId);
                  return (
                    <div key={cardId} className="col-span-1">
                      <SortableCard
                        id={cardId}
                        onRemove={() => removeCard(cardId)}
                        onResize={() => toggleCardSize(cardId)}
                        className="p-0"
                      >
                        {isLoading ? <SkeletonCard /> : <Component />}
                      </SortableCard>
                    </div>
                  );
                })}
            </div>
          </SortableContext>
        </DndContext>
      </section>
    </div>
  );
}
