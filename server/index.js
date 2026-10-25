import { ApolloServer, gql } from "apollo-server";

import {
  addDestination,
  getPaginatedDestinations,
  readDestinationById,
  removeDestination,
  updateDestinationById,
} from "./db.js";

const typeDefs = gql`
  type Destination {
    id: ID!
    name: String!
    description: String!
    location: String
    image: String
    rating: Float
    favorite: Boolean
  }

  type DestinationsResult {
    results: [Destination]
    totalCount: Int
  }

  input DestinationDTO {
    name: String
    location: String
    rating: Float
    description: String
  }

  type Query {
    getDestinationById(id: ID!): Destination
    destinations(page: Int!, size: Int!): DestinationsResult
  }

  type Mutation {
    createDestination(task: DestinationDTO!): Destination
    updateDestination(id: ID!, task: DestinationDTO!): Destination
    deleteDestination(id: ID!): Destination
    markFavorite(id: ID!, value: Boolean): Boolean
  }
`;

const resolvers = {
  Query: {
    getDestinationById: (root, args) => readDestinationById(args.id),
    destinations: (root, { page, size }) =>
      getPaginatedDestinations(page, size),
  },
  Mutation: {
    createDestination: (root, { task }) => addDestination(task),
    updateDestination: (root, { task, id }) => updateDestinationById(id, task),
    deleteDestination: (root, { id }) => removeDestination(id),
    markFavorite: (root, { id, value }) => {
      updateDestinationById(id, { favorite: value });
      return true;
    },
  },
};

const server = new ApolloServer({ 
  typeDefs, 
  resolvers,
  cors: {
    origin: "*",
  },
});
server.listen().then(({ url }) => {
  console.log(`Server endpoint: ${url}`);
});
