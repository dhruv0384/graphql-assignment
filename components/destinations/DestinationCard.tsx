import { useCallback } from "react";
import Link from "next/link";
import { MapPin, Star, Heart } from "lucide-react";
import { useMutation, gql } from '@apollo/client'

// components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// types
import { Destination } from "@/types";
import toast from "react-hot-toast";

const MARK_FAVORITE = gql`
  mutation MarkFavorite($id: ID!, $value: Boolean){
    markFavorite(id: $id, value: $value)
  }
`

export const DestinationCard = ({
  destination,
}: {
  destination: Destination;
}) => {
  const { id, name, favorite, location, rating } = destination;
  const [markFavorite] = useMutation(MARK_FAVORITE);

  const toggleFavorite = useCallback(async (event) => {
    event.preventDefault();
    // TODO: implement this
    try {
      await markFavorite({
        variables: {
          id,
          value: !favorite,
        },
        optimisticResponse: {
          markFavorite: !favorite
        },
        update(cache, {data}){
          if(!data?.markFavorite) return;

          cache.modify({
            id: cache.identify({
              __typename: 'Destination',
              id
            }),
            fields: {
              favorite: () => !favorite,
            }
          })
        }
      })
      toast.success(favorite ? "Removed from favorites" : "Added to favorites");
    } catch (err){
      toast.error("Failed")
    }
  }, [id, markFavorite, favorite]);

  return (
    <Link key={id} href={`/destination/${id}`}>
      <Card className="overflow-hidden p-2">
        <div className="relative">
          <img
            src={`https://picsum.photos/seed/${name}/600/700`}
            alt={name}
            className="w-full h-96 object-cover rounded-lg"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white rounded-full"
            onClick={toggleFavorite}
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={
                favorite ? "text-red-500 fill-red-500" : "text-gray-500"
              }
            />
          </Button>
        </div>
        <CardHeader>
          <CardTitle className="text-2xl">{name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin size={16} />
            <span>{location}</span>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Star className="text-yellow-400" size={16} />
            <span className="ml-1 text-sm font-medium">
              {rating.toFixed(1)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
