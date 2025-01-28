# stencil-query

A lightweight, reactive query client for [StencilJS](https://stenciljs.com/) components. It simplifies data fetching, caching, and state management in your Stencil applications.

## Features

- 🔄 **Reactive State Management**: Automatically updates your component when query state changes (loading, error, success).
- ⚡ **Lightweight**: Minimal overhead, built on `RxJS`.
- 🧩 **Easy Integration**: Uses a simple mixin pattern to enhance your Stencil components.
- 💾 **Caching**: Basic in-memory caching and request deduplication.

## Installation

```bash
npm install stencil-query rxjs
```

## Usage

### 1. Enhance your component

Use the `queryControllerFactory` mixin to add query capabilities to your Stencil component.

```tsx
import { Component, type ComponentInterface, h, Mixin } from '@stencil/core';
import type { QueryState } from 'stencil-query';
import { queryControllerFactory } from 'stencil-query/query-controller';

@Component({
  tag: 'my-user-profile',
})
export class MyUserProfile extends Mixin(queryControllerFactory) implements ComponentInterface {
  // Define a property to hold the query state
  protected userQuery: QueryState<UserData> | null = null;

  componentWillLoad() {
    // Initialize the query
    // The first argument is a unique key for the query
    // The second argument is the function that returns a Promise or Observable
    this.userQuery = this.useQuery('user-data', () => fetchUserData());
  }

  render() {
    // Destructure the state for easy access
    const { isBusy, data, error, refresh } = this.userQuery;

    if (isBusy) {
      return <div>Loading...</div>;
    }

    if (error) {
      return (
        <div>
          <p>Error: {error.message}</p>
          <button onClick={() => refresh()}>Retry</button>
        </div>
      );
    }

    return (
      <div>
        <h1>{data.name}</h1>
        <p>{data.email}</p>
        <button onClick={() => refresh()}>Refresh Data</button>
      </div>
    );
  }
}

async function fetchUserData() {
  const response = await fetch('/api/user');
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}
```

### 2. Query State API

The `useQuery` method returns a `QueryState` object with the following properties:

| Property     | Type                  | Description                                                                     |
| ------------ | --------------------- | ------------------------------------------------------------------------------- |
| `data`       | `T \| null`           | The data returned from the query function. `null` if not yet loaded.            |
| `isBusy`     | `boolean`             | `true` if the query is currently loading or fetching (initial load or refresh). |
| `isLoading`  | `boolean`             | `true` only during the initial load (no data yet).                              |
| `isFetching` | `boolean`             | `true` whenever the query function is executing.                                |
| `isError`    | `boolean`             | `true` if the last query attempt failed.                                        |
| `error`      | `Error \| null`       | The error object if the query failed.                                           |
| `refresh()`  | `() => Promise<void>` | A function to manually re-trigger the query.                                    |

## How it works

- **State Sharing**: The query state is shared by key. If multiple components use the same key, they will share the same data and loading state.
- **Reactivity**: The mixin automatically triggers a Stencil re-render whenever the query state changes.

## License

MIT
