// libs
import { useState, useCallback } from "react";

// components
import { CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tombstone } from "./Tombstone";
import { DestinationCard } from "./DestinationCard";

// hooks
import { useDestinationsQuery } from "@/hooks/useDestinationsQuery";

export function Destinations() {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;

  const { data, loading } = useDestinationsQuery({
    page: currentPage,
    size: itemsPerPage,
  });

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  let content: JSX.Element | null = null;

  const totalPages = Math.ceil((data?.totalCount ?? 0) / itemsPerPage);

  if (loading) {
    content = (
      <>
        {Array(itemsPerPage)
          .fill(0)
          .map((_, index) => (
            <Tombstone key={index} />
          ))}
      </>
    );
  } else if (!data) {
    content = (
      <CardTitle className="text-2xl">No destinations found!</CardTitle>
    );
  } else {
    const { results: destinations } = data;
    content = (
      <>
        {destinations.map((destination) => (
          <DestinationCard key={destination.id} destination={destination} />
        ))}
      </>
    );
  }

  return (
    <div className="flex-1 w-full h-full flex flex-col gap-2 items-center">
      <div className="flex-1 w-full flex items-center justify-center p-5">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content}
        </div>
      </div>

      {!loading ? (
        <Pagination className="mt-6 flex-none">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage >= 1) handlePageChange(currentPage - 1);
                }}
                aria-disabled={currentPage <= 0}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(index);
                  }}
                  isActive={currentPage === index}
                  aria-disabled={loading}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages - 1)
                    handlePageChange(currentPage + 1);
                }}
                aria-disabled={currentPage >= totalPages - 1}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  );
}
