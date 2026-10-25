export interface Destination {
  id: string;
  name: string;
  description: string;
  rating: number;
  location: string;
  favorite: boolean;
}

export type DestinationDTO = {
  name: string;
  location: string;
  rating: number;
  description: string;
}