import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function Tombstone() {
  return (
    <div className="w-full h-full">
      <header className="relative h-96">
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
          <Skeleton className="h-12 w-3/4 max-w-2xl mb-4" />
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm" disabled>
              <Skeleton className="h-4 w-4 mr-2 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </Button>
            <Button variant="secondary" size="sm" disabled>
              <Skeleton className="h-4 w-4 mr-2 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8 px-4">
        <div className="bg-white dark:bg-gray-800 mb-8">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </main>
    </div>
  );
}
