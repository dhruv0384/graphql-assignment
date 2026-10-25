// lib
import { useCallback, useState } from "react";
import { MapPin, Star, Edit, Heart, Trash2 as Trash } from "lucide-react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import { useMutation, gql } from "@apollo/client";
import { useRouter } from "next/router";

// components
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { DestinationForm } from "@/components/DestinationForm";
import { Tombstone } from "./Tombstone";

// hooks
import { useDestinationByIdQuery } from "@/hooks/useDestinationByIdQuery";

// types
import { Destination, DestinationDTO } from "@/types";

const UPDATE_DESTINATION = gql`
  mutation UpdateDestination($id: ID!, $task: DestinationDTO!){
    updateDestination(id: $id, task: $task){
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

const DELETE_DESTINATION = gql`
  mutation DeleteDestination($id: ID!){
    deleteDestination(id: $id){
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
const MARK_FAVORITE = gql`
  mutation MarkFavorite ($id: ID!, $value: Boolean){
    markFavorite(id: $id, value: $value)
  }
`

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

export function Detail({ id }: { id: string }) {
  const { destination, loading } = useDestinationByIdQuery({ id });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const [updateDestination] = useMutation(UPDATE_DESTINATION);

  const [deleteDestination] = useMutation(DELETE_DESTINATION, {
    update(cache, {data}){
      const id = data.deleteDestination?.id;
      if(!id) return;
      cache.updateQuery(
        {query: GET_DESTINATIONS},
        (existingData) => {
          if(!existingData) return existingData;
          return {
            results: existingData.results.filter(destination => destination.id !== id),
            totalCount: existingData.totalCount - 1
          }
        }
      )
    }
  });
  
  const [markFavorite] = useMutation(MARK_FAVORITE);
  // const [isFavorite, setIsFavorite] = useState(destination?.favorite);
  const isFavorite = destination?.favorite;

  const onSubmit = useCallback(async (_values: Partial<Destination>) => {
    // TODO: call destination mutation here
    try{
      const result = await updateDestination({
        variables: {
          id: id,
          task: _values
        }
      })

      setIsModalOpen(false);
    } catch (err: unknown) {
      err instanceof Error ? toast.error(err.message) : toast.error("Failed to update destination");
    }
  }, [id, updateDestination, setIsModalOpen]);

  const handleDelete = useCallback(async () => {
    // TODO: call destination mutation here
    try{
      const result = await deleteDestination({
        variables: {
          id
        }
      })

      if(result.data?.deleteDestination?.id){
        await router.push('/');
      }
    } catch (err: unknown){
      err instanceof Error ? toast.error(err.message) : toast.error("Failed to delete message")
    }
  }, [deleteDestination, id]);

  const toggleFavorite = useCallback(async () => {
    // TODO: add handling for favorite here
    try {
      const result = await markFavorite({
        variables: {
          id,
          value: !isFavorite
        }, 
        optimisticResponse: {
          markFavorite : !isFavorite
        },
        update(cache, {data}){
          if(!data?.markFavorite === null) return;
          cache.modify({
            id: cache.identify({
              __typename: 'Destination',
              id
            }),
            fields: {
              favorite: () => data.markFavorite,
            }
          })
        }
      })
      toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
      // isFavorite = result.data?.markFavorite
    } catch (err) {
      toast.error("Failed");
    }
  }, [isFavorite, id, markFavorite]);

  if (loading) {
    return <Tombstone />;
  }

  if (!destination) {
    return <header>No Destination Found</header>;
  }

  return (
    <div className="w-full h-full flex flex-col items-center gap-8 pt-8">
      <header className="relative h-96 w-full max-w-screen-lg">
        <img
          src={`https://picsum.photos/seed/${destination.name}/2000/1000`}
          alt={destination.name}
          className="w-full h-full object-cover rounded-2xl"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center rounded-2xl">
          <h1 className="text-5xl font-bold text-white text-center mb-8">
            {destination.name}
          </h1>
          <div className="flex space-x-2">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </DialogTrigger>
              <DestinationForm
                key={`${isModalOpen}`}
                destination={destination}
                onSubmit={onSubmit}
              />
            </Dialog>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash className="h-4 w-4" />
              Delete
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white rounded-full"
              onClick={() => toggleFavorite()}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart
                className={
                  isFavorite ? "text-red-500 fill-red-500" : "text-gray-500"
                }
              />
            </Button>
          </div>
        </div>
      </header>
      <main className="w-full max-w-screen-lg flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-lg p-6 mb-8"
        >
          <p className="text-lg mb-4">{destination.description}</p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <MapPin size={20} />
              <span>{destination.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="text-yellow-400" size={20} />
              <span className="font-semibold">
                {destination.rating?.toFixed(1)}
              </span>
            </div>
          </div>
        </motion.div>
      </main>
      <Toaster />
    </div>
  );
}
