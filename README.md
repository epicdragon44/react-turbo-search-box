# A Turbo-charged Search Box

A super-extra, TypeScript-ready, mutex-locked, state-preserving, fuzzy-sorting, pre-and-post-processable search bar for all (some) of your frontend needs.

![Test](https://github.com/epicdragon44/react-turbo-search-box/actions/workflows/test.yml/badge.svg)

## Installation

```bash
npm install react-turbo-search-box
```

or

```bash
yarn add react-turbo-search-box
```

## Usage: the TLDR

```tsx
import TurboSearchBox from "react-turbo-search-box";

export function App() {
    return (
        <>
            <TurboSearchBox
                /* Set the rendered list you want to show */
                dispatchNewList={(newList) => {
                    // setter here!
                }}
                sortBehavior={{
                    /* Keys to use in comparisons to determine search/sorted order */
                    keys: ["name", "description", "tags"],
                }}
                lockBehavior={{
                    /* Optional: Whether or not to cache the list of items to search through */
                    cacheMode: true,
                    /* Optional: Callback to notify when the lock state changes */
                    notifyLockChange: (newLockVal) => {
                        // do something!
                    },
                    /* Optional: Update this value arbitrarily whenever you want to force SearchBar to give up the lock */
                    forceReleaseLock: 0,
                }}
                info={{
                    /* List of all items to search through */
                    fullBaseList: [
                        // ...
                    ],
                    /* List of items that are currently being displayed */
                    currWorkingList: [
                        // ...
                    ],
                }}
                style={{
                    width: "50%",
                }}
            />
        </>
    );
}
```

## Usage: the long version

Search Bar Component that fuzzy sorts and filters a props-provided list of type `<T, K?>` (via a props-provided setter) based on user-provided graphical input.
Additionally, this component employs an optional lock and cache, as well as optional pre and post-processing.

**dispatchNewList**

This is the main callback that you should use to set your displayed list to the search-sorted list.

**Lock Behavior Props**

_For locks:_
If you provide the `notifyLockChange` prop, we'll notify you when the lock is changed (when the search bar is either searching, or not).
Additionally, if you provide `forceReleaseLock`, we'll release the lock when that signal is triggered (you'll have to use the `useEventSignal` hook in your application to maintain the signal)

_For caching:_
If you provide the `cacheMode` prop, we'll cache the list before and after we search.
That means we'll cache the exact current list before we acquire the search lock, and revert back to the cached list when the lock is freed.
If you don't provide it, we'll just revert to the full base list when the search is over and the lock is freed.

_Caching and Locks are often provided together:_

-   When the lock is true, we're in searching mode, and it is encouraged to not edit the list until the lock is freed (would lead to untested and potentially unwanted behavior).
-   Essentially, if you provide `notifyLockChange` and `cacheMode`, this becomes a state-safe search bar that encourages not editing of the list while searching, and will return the list to its original state when the search is over.

**Sort Behavior Props**

The `keys` prop is a list of keys in the object that we're using for search relevancy comparisons. We'll search against all of them.

For pre and post-processing:
Generic type T is the type of object in the list that we're searching through.
Generic type K is optional, and is the type of object that we're searching through after we've pre-processed it. Naturally, it must be a subtype of T. Normally, this is used to improve searching accuracy by adding keys to the object that we can search against.

-   If provided, we're assuming you'll be providing a preProcess function T->K, AND a postProcess function K->T. All three (K, T->K, K->T) must be provided together, or not at all.
-   Note that all parameters in K that are not in T should probably be optional -- otherwise, you'll have trouble deleting them in the postProcess function.

**Information Props**

The `fullBaseList` prop is the full list of all items to comb through -- shouldn't change.
The `currWorkingList` prop is the current working "head" of the list.
