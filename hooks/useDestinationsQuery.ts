import { useEffect, useMemo, useState } from "react";

// constants
import { allDestinations } from "./mocks/destinations";

// types
import { Destination } from "@/types";
import { useQuery, gql } from "@apollo/client";

type Params = {
  page: number;
  size?: number;
};

type ReturnType = {
  data?: {
    results: Destination[];
    totalCount: number;
  };
  loading: boolean;
};

const DEFAULT_SIZE = 3;

const GET_DESTINATIONS = gql`
  query GetDestinations($page: Int!, $size: Int!){
    destinations(page: $page, size: $size){
      results {
        id
        name
        description
        location
        image
        rating
        favorite
      }
      totalCount
    }
  }
`

// TODO: use apollo query for this
export const useDestinationsQuery = ({
  page,
  size = DEFAULT_SIZE,
}: Params): ReturnType => {
  // const [loading, setLoading] = useState(false);
  // const data = useMemo(
  //   () => ({
  //     results: allDestinations.slice(page * size, page * size + size),
  //     totalCount: allDestinations.length,
  //   }),
  //   [page, size]
  // );

  const {data, error, loading} = useQuery(GET_DESTINATIONS, {
    variables : {
      page,
      size,
    }
  })

  // useEffect(() => {
  //   if (page) {
  //     setLoading(true);
  //     const timeout = setTimeout(() => {
  //       setLoading(false);
  //     }, 800);

  //     return () => {
  //       clearTimeout(timeout);
  //     };
  //   }
  // }, [page]);

  return { data: data?.destinations, loading };
};
