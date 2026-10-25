import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Tombstone = () => (
  <Card className="overflow-hidden">
    <Skeleton className="h-96 w-full" />
    <CardHeader>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-5/6" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-1/2 mb-2" />
      <Skeleton className="h-4 w-1/4" />
    </CardContent>
  </Card>
);
