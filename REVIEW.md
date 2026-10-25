# Apollo Client Assignment — Code Review

**Date:** 2026-10-25
**Reviewer:** Claude (Opus 4.8)
**Scope:** Full review against the deliverables in `README.md`, with emphasis on **cache updates** and **pagination** (your stated areas of concern).

---

## TL;DR

You've done the bulk of the work well — all five mutations are wired, queries are dynamic, optimistic favorites exist, and edit updates reflect automatically. But the parts you suspected are indeed where the gaps are. Three of them will produce **visibly wrong behavior**, not just theoretical issues:

| # | Severity | Area | Problem |
|---|----------|------|---------|
| 1 | 🔴 High | Favorite (`/` route) | `toggleFavorite` in `DestinationCard` is unimplemented — the heart on the home page does nothing. Required by the spec. |
| 2 | 🔴 High | Cache update (create + delete) | `cache.updateQuery({ query: GET_DESTINATIONS })` is called **without `page`/`size` variables**, so it never matches the paginated cache entries — the update is a silent no-op. |
| 3 | 🔴 High | Favorite (server contract) | `markFavorite` resolver **always returns `true`**, and your cache update writes `favorite: () => data.markFavorite`. Un-favoriting flips back to favorited once the server responds. |
| 4 | 🟡 Medium | Delete | Normalized `Destination:id` object is never evicted; it dangles in the cache after delete. |
| 5 | 🟡 Medium | Favorite guard | `if (!data?.markFavorite === null)` is a logic bug — this condition is always `false`. |
| 6 | 🟢 Low | Pagination/UX | Pager disappears on every page change; `error` from queries is swallowed; no `<Toaster/>` on the `/` route. |

---

## What's done well ✅

- **Apollo setup** (`pages/_app.tsx`) is correct and clean; `ApolloProvider` wraps the app, devtools enabled.
- **`useDestinationsQuery` / `useDestinationByIdQuery`** are properly converted to `useQuery` with variables — the mock scaffolding is cleanly commented out.
- **Create** (`Header.tsx`) correctly redirects to `/destination/${id}` on success and keeps the modal open on error (`setIsModalOpen(false)` sits after the `await`, so a throw skips it). Error toast path is correct.
- **Edit** (`Detail.tsx`) is handled elegantly — because `updateDestination` returns `id` plus all fields, Apollo normalizes the result and the detail view (which reads the same `Destination:id` entity) updates **automatically with zero manual cache code**. This is exactly the right instinct. ✅
- **Optimistic favorite** uses `optimisticResponse`, so Apollo auto-rolls back on error and the heart resets with an error toast — the spec's failure requirement is satisfied *for the detail route*.

---

## Detailed findings

### 🔴 1. Favorite is not implemented on the `/` route

`components/destinations/DestinationCard.tsx:18-22`

```ts
const toggleFavorite = useCallback((event) => {
  event.preventDefault();
  // TODO: implement this
  console.log("Unimplemented");
}, []);
```

The README explicitly requires the heart button to work in **both** `/` and `/destination/[id]`. Right now clicking the heart on a card on the home page only logs to the console. The entire optimistic-favorite requirement is unmet on the list page.

**Fix:** lift the `markFavorite` mutation into the card (or a shared hook) and reuse the same optimistic + `cache.modify` logic you wrote in `Detail.tsx`. Example:

```ts
const [markFavorite] = useMutation(MARK_FAVORITE);

const toggleFavorite = useCallback(async (event) => {
  event.preventDefault();      // keep the <Link> from navigating
  event.stopPropagation();
  try {
    await markFavorite({
      variables: { id, value: !favorite },
      optimisticResponse: { markFavorite: !favorite },
      update(cache) {
        cache.modify({
          id: cache.identify({ __typename: "Destination", id }),
          fields: { favorite: () => !favorite },  // see finding #3
        });
      },
    });
  } catch {
    toast.error("Failed to update favorite");
  }
}, [id, favorite, markFavorite]);
```

> Note: there is also **no `<Toaster/>` mounted on the `/` route** (only `Detail.tsx` renders one). Even once favorites work on cards, error/success toasts won't appear on the home page. Mount a `<Toaster/>` in `pages/index.tsx` (or in `_app.tsx` globally, which is cleaner).

---

### 🔴 2. Cache updates for create & delete never match (missing pagination variables)

`components/Header.tsx:48-60` and `components/detail/Detail.tsx:92-107`

```ts
cache.updateQuery(
  { query: GET_DESTINATIONS },           // ❌ no variables
  (existingData) => { ... }
);
```

`destinations` is a **paginated field** keyed by its arguments. In the normalized cache it is stored under keys like:

```
destinations({"page":0,"size":3})
destinations({"page":1,"size":3})
```

`cache.updateQuery({ query: GET_DESTINATIONS })` with **no `variables`** asks the cache to read `destinations` with `page/size = undefined`. That key doesn't exist, so `existingData` is `null`, your updater returns `existingData` unchanged, and **the update is a silent no-op**. The list is never corrected after a create or delete.

You can observe this: create or delete a destination, then navigate back to `/` — because the default fetch policy is `cache-first`, you'll see the **stale** page (missing new item / still showing the deleted one) until a hard refetch.

There's a second, deeper problem specific to **create**: even if you *did* pass the right variables, appending to one page's `results` is semantically wrong for page-based pagination — page 0 would then hold 4 items instead of `size` (3), and `totalCount` only increments on that one cached page. Pagination math (`totalPages`) would drift.

**Recommended fix — evict the whole field so every page refetches on next read.** This is the cleanest approach for numbered-page pagination because it doesn't try to manually reconcile offsets across pages:

```ts
// create (Header.tsx) and delete (Detail.tsx)
update(cache, { data }) {
  if (!data?.createDestination) return;       // or deleteDestination
  cache.evict({ fieldName: "destinations" }); // drops all cached pages
  cache.gc();
}
```

Alternatively, if you prefer an explicit refetch over eviction:

```ts
const [createDestination] = useMutation(CREATE_DESTINATION, {
  refetchQueries: ["GetDestinations"],  // refetches every active instance
});
```

For **create** specifically, note the redirect to the detail page means the list isn't even mounted at mutation time — eviction/refetch-on-next-mount is the right model, which `cache.evict` handles naturally.

---

### 🔴 3. `markFavorite` reverts on server response (broken return contract)

`server/index.js:57-60`:

```js
markFavorite: (root, { id, value }) => {
  updateDestinationById(id, { favorite: value });
  return true;          // ⚠️ always true, regardless of `value`
},
```

`components/detail/Detail.tsx:157-167`:

```ts
update(cache, { data }) {
  ...
  fields: { favorite: () => data.markFavorite },  // data.markFavorite is ALWAYS true
}
```

Sequence when **un-favoriting** (current `favorite === true`):
1. Optimistic response sets `markFavorite: !isFavorite` → `false`. Heart correctly turns gray. ✅
2. Real server response arrives: `markFavorite === true` (always). Your `update` runs again and writes `favorite: () => true`. **Heart flips back to red.** ❌

So un-favoriting looks like it works for a split second, then snaps back. Favoriting *appears* fine only because the final value coincidentally matches.

**Fix (client-side, don't trust the return):** write the value you *sent*, not the server's boolean:

```ts
const nextValue = !isFavorite;
await markFavorite({
  variables: { id, value: nextValue },
  optimisticResponse: { markFavorite: nextValue },
  update(cache) {
    cache.modify({
      id: cache.identify({ __typename: "Destination", id }),
      fields: { favorite: () => nextValue },
    });
  },
});
```

**Better fix (if you may touch the server):** have the resolver return the new favorite state so the type is a `Destination` (or echo the value), which lets Apollo normalize automatically. Changing `markFavorite` to return the updated `Destination` would remove the need for a manual `cache.modify` entirely — the normalized entity update would propagate to both `/` and `/destination/[id]`.

---

### 🟡 4. Delete leaves a dangling normalized entity

`components/detail/Detail.tsx:92-107`

Even after you fix the `updateQuery` variables (finding #2), the normalized `Destination:<id>` object itself is never removed from the cache. Any other query still referencing it keeps it alive. Use `evict` + `gc`:

```ts
update(cache, { data }) {
  const deletedId = data?.deleteDestination?.id;
  if (!deletedId) return;
  cache.evict({ id: cache.identify({ __typename: "Destination", id: deletedId }) });
  cache.evict({ fieldName: "destinations" }); // refresh the paginated list
  cache.gc();
}
```

---

### 🟡 5. Always-false guard in the favorite `update`

`components/detail/Detail.tsx:158`

```ts
if(!data?.markFavorite === null) return;
```

Operator precedence makes this `(!data?.markFavorite) === null`. The left side is always a boolean (`true`/`false`), which is never `=== null`, so the guard **never triggers**. It's harmless today (the body runs regardless) but it signals the wrong intent. If you meant "bail when there's no data," write:

```ts
if (data?.markFavorite == null) return;
```

(Though once you adopt finding #3's `nextValue` approach, you don't read `data` here at all.)

---

### 🟢 6. Pagination & smaller items

- **Pager vanishes on page change.** `Destinations.tsx:70` renders the pager only when `!loading`. With a new `page` variable, `useQuery` returns `data === undefined` while fetching, so the pager unmounts and remounts on every navigation — a visible flicker, and `totalPages` momentarily collapses to 0. Consider keeping the previous data visible with `keepPreviousData` / reading `previousData`, or gating only the *cards* on `loading` while leaving the pager mounted (guard it on `data?.totalCount` instead).
- **Page-based caching is otherwise correct.** You do **not** need a `merge`/`fieldPolicy` here — numbered pages are meant to be stored as separate cache entries, and that's what the default `InMemoryCache` does. (A `merge` would only be needed for infinite-scroll/"load more".) So "no `typePolicies`" is *not* a bug for this UI; the real pagination issue is purely the stale-cache-after-mutation problem in finding #2.
- **Query errors are swallowed.** Both hooks destructure `error` but never return it. On a network/server error, `useDestinationsQuery` returns `!data` and the UI shows "No destinations found!" — indistinguishable from an empty result. Surface `error` and render a distinct error state.
- **`useMemo`/`useState`/`allDestinations` dead imports** remain in both hooks — minor cleanup.
- **`DestinationCard` prop type** — `toggleFavorite`'s `event` param is implicitly `any`; type it as `React.MouseEvent` once you implement it.

---

## Suggested priority order

1. **#3** — fix the favorite revert (use `nextValue`, not the server's `true`). Quick, high-impact.
2. **#1** — implement favorites on `DestinationCard` + mount a `<Toaster/>` for `/`.
3. **#2 / #4** — switch create & delete to `cache.evict({ fieldName: "destinations" })` + `cache.gc()` (and evict the deleted entity).
4. **#5, #6** — guard cleanup, pager flicker, surfacing query errors, dead-import cleanup.

Items #1–#4 are the difference between "the mutations fire" and "the UI stays consistent," which is the heart of what this assignment is testing. Nice work on the edit-via-normalization and optimistic-rollback pieces — those show you understand the cache model; the fixes above are about applying that same understanding to the paginated list field.
