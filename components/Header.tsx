//libs
import { Plus, Server } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import toast from "react-hot-toast";
import {useMutation, gql} from "@apollo/client"
import type { Destination, DestinationDTO } from "@/types";
import { useRouter } from "next/router";

// components
import { DestinationForm } from "@/components/DestinationForm";
import { Button } from "@/components/ui/button";

const CREATE_DESTINATION = gql`
  mutation CreateDestination($task: DestinationDTO!){
    createDestination(task: $task){
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

export const Header = (): JSX.Element => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createDestination] = useMutation(CREATE_DESTINATION, {
    update(cache, {data}){
      if(!data.createDestination) return;
      cache.updateQuery(
        {query: GET_DESTINATIONS},
        (existingData) => {
          if(!existingData) return existingData;
          return {
            results: [...existingData.results, data.createDestination],
            totalCount: existingData.totalCount + 1
          }
        }
      )
    }
  })
  const router = useRouter();

  const onSubmit = useCallback(async (_values: Partial<Destination>) => {
    // TODO: call destination mutation here and redirect to it's page
    try {
      const result = await createDestination({
        variables: {
          task: _values
        }
      })
      const id = result.data?.createDestination?.id;
      setIsModalOpen(false);
      if(id){
        await router.push(`/destination/${id}`);
      }
    } catch (err: unknown) {
      err instanceof Error ? toast.error(err.message) : toast.error("Failed to create destination")
    }

  }, [setIsModalOpen, createDestination]);

  return (
    <div className="flex gap-4 items-center p-5 bg-white rounded-2xl justify-between border">
      <Link href="/">
        <h1 className="flex-1 text-2xl font-semibold">Trip Finder 🚗</h1>
      </Link>
      <div className="flex gap-2 items-center">
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Create
            </Button>
          </DialogTrigger>
          <DestinationForm key={`${isModalOpen}`} onSubmit={onSubmit} />
        </Dialog>
        <Button asChild>
          <a href="http://localhost:4000/" target="_blank">
            <Server />
            Open Server
          </a>
        </Button>
      </div>
    </div>
  );
};
