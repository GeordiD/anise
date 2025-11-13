# Frontend Development Guidelines

## Data Fetching & Cache Invalidation

### Pattern: Keyed Data Fetching

Always use a `key` parameter with `useFetch` to enable cache invalidation from any component:

```typescript
// Page or parent component
const { data } = await useFetch('/api/resource', {
  key: 'resource-name',
});
```

### Invalidating Data After Mutations

Child components can mutate data and invalidate the cache without prop drilling:

```typescript
// Child component (e.g., modal, nested component)
async function handleMutation() {
  // Perform mutation
  await $fetch('/api/resource', {
    method: 'POST',
    body: payload,
  });

  // Invalidate cache - triggers automatic refetch
  await refreshNuxtData('resource-name');
}
```

### Benefits

- **No prop drilling** - No need to pass `refresh()` functions through props/events
- **Separation of concerns** - Components handle their own mutations
- **Global cache management** - Any component can trigger data refresh
