import { Skeleton } from "../ui/skeleton";

export function UserSkeleton() {
  return (
    <div className="flex items-center space-x-4 px-2 p-1 ">
      <Skeleton className="size-10 rounded-full" />
      <div className="space-y-1 w-full">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
