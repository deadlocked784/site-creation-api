import { useParams } from "react-router";
import ContributionDefault from "./components/contribution-default";
import { getContribution } from "@/services/contributions";
import { useQuery } from "@tanstack/react-query";
import ContributionDefaultSkeleton from "./components/contribution-default-skeleton";
import ActionButtons from "./components/action-buttons";

export default function ContributionDetailPage() {
  const { id = '' } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['contribution', id],
    queryFn: () => getContribution(id)
  });

  if (isError) {
    return <div className="container mx-auto py-5 px-8">Error loading contribution details.</div>;
  }

  return (
    <div className="container mx-auto py-5 px-4  flex flex-col gap-6">
      {isLoading
        ?
        <ContributionDefaultSkeleton />
        :
        <>
          <ContributionDefault contribution={data!} />
          <ActionButtons />
        </>
      }
    </div>
  );
}