## Apollo Client Assignment

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
GraphQL server will be running at [http://localhost:3000](http://localhost:4000), Available Queries and mutation are listed there.

### Goals

- [] Setup Apollo Client

- [] Integrate `destinations` query fetch destinations dynamically in `hooks/useDestinationsQuery.ts`

- [] Integrate `getDestinationById` query to fetch destination by id dynamically in `hooks/useDestinationByIdQuery.ts`

- [] Implement create destination functionality in `/` route

  - [] Hit `createDestination` mutation on create form submit
  - [] Redirect to `destination/${id}` on success
  - [] Show Error toast on failure and modal should not close.

- [] Implement edit destination functionality in `/destination/[id]` route

  - [] Hit `updateDestination` mutation on edit form submit
  - [] Page should reflect with the updated values as soon as submit is successful
  - [] Show Error toast on failure and changes should not reflect and modal should not close.

- [] Implement destination mark as favorite mutation

  - [] Hit `markFavorite` mutation on click of heart button in `/` and `/destination/[id]` routes
  - [] Interaction must be optimistic, i.e. update Apollo Cache such that user see the change instantly
  - [] If mutation fails then state should reset with error toast

- [] Implement delete functionality in `/destination/[id]` route
  - [] Hit `deleteDestination` mutation on delete button click
  - [] On Success redirect to `/` route
  - [] Show Error toast on failure
