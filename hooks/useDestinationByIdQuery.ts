import { useMemo } from "react";
import {useQuery, gql} from "@apollo/client"

// constants
import { allDestinations } from "./mocks/destinations";

// types
import { Destination } from "@/types";

type Params = {
  id: string;
};

type ReturnType = {
  destination?: Destination;
  loading: boolean;
};

const GET_DESTINATION_BY_ID= gql`
  query GetDestinationById ($id: ID!) {
    getDestinationById(id: $id){
      id
      name
      description
      location
      image
      rating
      favorite
    }
  }
`

// TODO: use apollo query for this
export const useDestinationByIdQuery = ({ id }: Params): ReturnType => {
  // const destination = useMemo(
  //   () => allDestinations.find((destination) => destination.id === id),
  //   [id]
  // );

  const {data, loading, error} = useQuery(GET_DESTINATION_BY_ID, {variables: {
    id: id
  }})

  return {
    destination: data?.getDestinationById,
    loading,
  };
};
