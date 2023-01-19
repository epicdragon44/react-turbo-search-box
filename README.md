# A Turbo-charged Search Box

A super-extra, TypeScript-ready, mutex-locked, state-preserving, fuzzy-sorting, pre-and-post-processable search bar for all (some) of your frontend needs.

## Installation

```bash
npm install react-turbo-search-box
```

or

```bash
yarn add react-turbo-search-box
```

## Usage

```tsx
import { SearchBar } from "react-turbo-search-box";
```

```tsx
<SearchBar
    dispatchNewList={(newList) => {
        /* Set the rendered list you want to show */
    }}
    sortBehavior={{
        keys: [
            /* Keys to use in comparisons to determine search/sorted order */
        ],
    }}
    lockBehavior={{
        cacheMode:
            true /* Optional: Whether or not to cache the list of items to search through */,
        notifyLockChange: () => {
            /* Optional: Callback to notify when the lock state changes */
        },
        forceReleaseLock:
            number /* Optional: Update this value arbitrarily whenever you want to force SearchBar to give up the lock */,
    }}
    info={{
        fullBaseList: [
            /* List of all items to search through */
        ],
        currWorkingList: [
            /* List of items that are currently being displayed */
        ],
    }}
    style={
        {
            /* Normal inline styles to pass to the input element */
        }
    }
/>
```
