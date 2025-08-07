import { useQuery } from "@tanstack/react-query";
import ContactSummary from "./components/contact-summary";
import { useParams } from "react-router";
import { getContact, getContactContributionsCount, getContactActivitiesCount } from "@/services/contacts";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ContactSummarySkeleton from "./components/contact-summary-skeleton";
import ContactContributions from "./components/ContactContributions";
import AdditionalInfo from "./components/ContactAdditionalDetails/components/additional-details";
import { Badge } from "@/components/ui/badge";
import { getActivitiesByContactId } from "@/services/activity";
import { activityListColumns } from "@/pages/Activities/ActivityListPage/components/columns/activities-list-columns";
import DataTable from "@/components/table/data-table";
import { AddActivityDialog } from "@/pages/Activities/ActivityListPage/components/add-activity-dialog";
import { useState } from "react";
import { activityFilters } from "@/components/table/data-table-filter-field";
import { useDataTableFilters } from "@/hooks/use-table-data-filters";


export default function ContactDetailPage() {
  const { id = '' } = useParams();

  const { data: contactData, isLoading: isContactLoading, isError: isContactError } = useQuery({
    queryKey: ['contact', 'summary'],
    queryFn: () => getContact(parseInt(id))
  });

  const { data: activitiesData, isLoading: isActivitiesLoading, isError: isActivitiesError } = useQuery({
    queryKey: ['contact', 'activities'],
    queryFn: () => getActivitiesByContactId(id)
  });


    useDataTableFilters(activityFilters, activitiesData ?? []);


  const contributionCountQuery = useQuery({
    queryKey: ['contact', 'contributions', id, 'count'],
    queryFn: () => getContactContributionsCount(id),
  });

  const activitiesCountQuery = useQuery({
    queryKey: ['contact', 'activities', id, 'count'],
    queryFn: () => getContactActivitiesCount(id),
  });

  const [activeTab, setActiveTab] = useState("additional-info");

  if (isContactError) {
    return <div className="container mx-auto py-5 px-8">Error loading contact details.</div>;
  }

  return (
    <div className="container mx-auto py-5 px-8 flex flex-col gap-6">
      {isContactLoading ? <ContactSummarySkeleton /> : <ContactSummary/>}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="flex gap-2">
            <TabsTrigger value="additional-info">Additional Info</TabsTrigger>
            <TabsTrigger value="contributions">
              Contributions
              {!contributionCountQuery.isLoading && (
                <Badge variant="outline" className="h-5 min-w-5 rounded-full px-1 ml-1">
                  {contributionCountQuery.data}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="activities">
              Activities
              {!activitiesCountQuery.isLoading && (
                <Badge variant="outline" className="h-5 min-w-5 rounded-full px-1 ml-1">
                  {activitiesCountQuery.data}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {activeTab === "activities" && <AddActivityDialog />}
        </div>

        <TabsContent value="additional-info">
          {contactData && <AdditionalInfo contactData={contactData} loading={isContactLoading} />}
        </TabsContent>

        <TabsContent value="contributions">
          <ContactContributions contactId={id} contactName={contactData?.display_name} />
        </TabsContent>

        <TabsContent value="activities">
          {isActivitiesError && (
            <Card className="p-4 text-red-600">Failed to load activities.</Card>
          )}
          {!isActivitiesError && !isActivitiesLoading && (
            <DataTable
              columns={activityListColumns}
              data={activitiesData ?? []}
              isLoading={isActivitiesLoading}
              showUpdateButton={true}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

