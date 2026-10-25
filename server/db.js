import { resolve } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

const DB_PATH = resolve(process.cwd(), "./db.json");

const getDestinations = () => {
  return JSON.parse(readFileSync(DB_PATH, { encoding: "utf-8" }));
};

const writeDestinations = (destinations) => {
  writeFileSync(DB_PATH, JSON.stringify(destinations, null, 2));
};

export const addDestination = (destination) => {
  const destinations = getDestinations();
  const newDestination = { ...destination, id: randomUUID(), favorite: false };
  writeDestinations([...destinations, newDestination]);
  return newDestination;
};

export const readDestinationById = (id) => {
  const destinations = getDestinations();
  return destinations.find((destination) => destination.id === id);
};

export const getPaginatedDestinations = (page, size) => {
  const offset = page * size;
  const currentDestinations = getDestinations();
  return {
    results: currentDestinations.slice(offset, offset + size),
    totalCount: currentDestinations.length,
  };
};

export const updateDestinationById = (id, destinationDTO) => {
  const currentDestinations = getDestinations();
  const destination = currentDestinations.find(
    (destination) => destination.id === id
  );

  if (!destination) {
    throw new Error("No Destination!");
  }

  const updatedDestination = { ...destination, ...destinationDTO };

  writeDestinations(
    currentDestinations.map((destination) => {
      if (destination.id !== id) return destination;
      return updatedDestination;
    })
  );

  return updatedDestination;
};

export const removeDestination = (id) => {
  const currentDestinations = getDestinations();
  const destination = currentDestinations.find(
    (destination) => destination.id === id
  );

  if (!destination) {
    throw new Error("No Destination!");
  }

  writeDestinations(
    currentDestinations.filter((destination) => destination.id !== id)
  );

  return destination;
};
