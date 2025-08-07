import { useParams } from "react-router";
import ActivityDefault from "./components/activity-default";
import { getActivity } from "@/services/activity";
import { useQuery } from "@tanstack/react-query";
import ActivityDefaultSkeleton from "./components/activity-default-skeleton";
import ActionButtons from "./components/action-buttons";

export default function ActivityDetailPage() {
  const { id = '' } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['activity', id],
    queryFn: () => getActivity(id)
  });
  if (isError) {
    return <div className="container mx-auto py-5 px-8">Error loading activity details.</div>;
  }

  return (
    <div className="container mx-auto py-5 px-4  flex flex-col gap-6">
      {isLoading
        ?
        <ActivityDefaultSkeleton />
        :
        <>
          <ActivityDefault activity={data!} />
          <ActionButtons/>
        </>
      }
    </div>
  );
}