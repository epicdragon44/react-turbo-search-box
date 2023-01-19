import fuzzysort from "fuzzysort";
import React, { useCallback, useEffect, useState } from "react";
import { Signal, usePrevious } from "./hooks";

/** Information necessary to perform the sort */
export type InformationProps<T> = {
    /** Full list of all items to comb through -- shouldn't change */
    fullBaseList: T[];
    /** Current working "head" of the list */
    currWorkingList: T[];
};

/** Describe sorting behavior */
export type SortBehaviorProps<T, K> = {
    /** What keys in each object to search against */
    keys: string[];
    /**
     * Optional: pre-process the list before we search against it,
     * normally to add keys to parameters we can use for searching
     */
    preProcess?: (list: T[]) => K[];
    /**
     * Optional: post-process the list before we set it back,
     * normally to remove keys we added for searching.
     */
    postProcess?: (list: K[]) => T[];
};

export type LockBehaviorProps = {
    /** Make the search bar cache the list before searches, and restore it on search finish */
    cacheMode?: boolean;
    /** Notify wrapper of lock change status -- `true` means locked! */
    notifyLockChange?: (newLockVal: boolean) => void;
    /**
     * Force the search bar to release the lock and end the search when you call this
     * (useful for when you want to end the search early, e.g. when the user clicks away,
     * otherwise you may run into issues where you've cached the wrong list.)
     */
    forceReleaseLock?: Signal;
};

export type SearchBoxStylingProps = {
    /** If not provided, defaults to 420px */
    width: string;
};

export type SearchBarProps<T, K> = {
    /** Output setter for the sorted list for the wrapper to use -- use this! */
    dispatchNewList: (infoHead: T[]) => void;
    /** Describe cache/lock behavior */
    lockBehavior: LockBehaviorProps;
    /** Describe sorting behavior */
    sortBehavior: SortBehaviorProps<T, K>;
    /** Information necessary to perform the sort */
    info: InformationProps<T>;
};

/**
 * Search Bar Component that fuzzy sorts and filters a props-provided list of type `<Generic T>` (via a props-provided setter) based on user-provided graphical input.
 * Additionally, this component employs an optional lock and cache, as well as optional pre and post-processing.
 *
 * **dispatchNewList**
 *
 * This is the main callback that you should use to set your displayed list to the search-sorted list.
 *
 * **Lock Behavior Props**
 *
 * For locks:
 * If you provide the `notifyLockChange` prop, we'll notify you when the lock is changed (when the search bar is either searching, or not).
 * Additionally, if you provide `forceReleaseLock`, we'll release the lock when that signal is triggered (you'll have to use the `useEventSignal` hook in your application to maintain the signal)
 *
 * For caching:
 * If you provide the `cacheMode` prop, we'll cache the list before and after we search.
 * That means we'll cache the exact current list before we acquire the search lock, and revert back to the cached list when the lock is freed.
 * If you don't provide it, we'll just revert to the full base list when the search is over and the lock is freed.
 *
 * Caching and Locks are often provided together:
 * - When the lock is true, we're in searching mode, and it is encouraged to not edit the list until the lock is freed (would lead to untested and potentially unwanted behavior).
 * - Essentially, if you provide `notifyLockChange` and `cacheMode`, this becomes a state-safe search bar that encourages not editing of the list while searching, and will return the list to its original state when the search is over.
 *
 * **Sort Behavior Props**
 *
 * The `keys` prop is a list of keys in the object that we're using for search relevancy comparisons. We'll search against all of them.
 *
 * For pre and post-processing:
 * Generic type T is the type of object in the list that we're searching through.
 * Generic type K is optional, and is the type of object that we're searching through after we've pre-processed it. Naturally, it must be a subtype of T. Normally, this is used to improve searching accuracy by adding keys to the object that we can search against.
 * - If provided, we're assuming you'll be providing a preProcess function T->K, AND a postProcess function K->T. All three (K, T->K, K->T) must be provided together, or not at all.
 * - Note that all parameters in K that are not in T should probably be optional -- otherwise, you'll have trouble deleting them in the postProcess function.
 *
 * **Information Props**
 *
 * The `fullBaseList` prop is the full list of all items to comb through -- shouldn't change.
 * The `currWorkingList` prop is the current working "head" of the list.
 */
export default function SearchBar<T, K = T>(
    props: SearchBarProps<T, K> &
        Partial<React.FC<React.PropsWithoutRef<JSX.IntrinsicElements["div"]>>>
) {
    const { dispatchNewList, sortBehavior, lockBehavior, info } = props;
    /** Destruct behavior props */
    const { keys, preProcess, postProcess } = sortBehavior;
    /** Destruct info props */
    const { fullBaseList, currWorkingList } = info;
    /** Destruct lock props */
    const { cacheMode, notifyLockChange, forceReleaseLock } = lockBehavior;

    /** Used to control search bar text */
    const [searchText, setSearchText] = useState<string>("");

    /**
     * Search Bar Lock
     * When the lock is true, we're in searching mode. Filters are disabled. We'll cache the previous patientinfohead.
     * When the lock is false, we are no longer searching. Filters are enabled. We'll offload the cache into the actual list.
     */
    const [searchLock, setSearchLock] = useState<boolean>(false);

    /**
     * Cache the patient info head when we start searching
     * so we can revert back to the original list when we're done.
     */
    const [cachedPatientInfoHead, setCachedPatientInfoHead] = useState<T[]>([]);

    /** Keep track of the previous Search Text */
    const prevSearchText = usePrevious<string>(searchText);

    /**
     * When the search text changes, and provided the lock is acquired, update the patient info head.
     * This should only happen when the search lock is acquired.
     */
    useEffect(() => {
        if (searchLock) {
            if (preProcess && postProcess) {
                const preprocessedArr = preProcess(fullBaseList);

                const sortedArr = fuzzysort.go(searchText, preprocessedArr, {
                    keys: keys,
                    all: true,
                });

                const retypedArr = sortedArr.map(
                    (patient: typeof sortedArr[0]) => patient.obj
                );

                const postprocessedArr = postProcess(retypedArr);

                dispatchNewList(postprocessedArr);
            } else {
                const sortedArr = fuzzysort.go(searchText, fullBaseList, {
                    keys: keys,
                    all: true,
                });

                const retypedArr = sortedArr.map(
                    (patient: typeof sortedArr[0]) => patient.obj
                );

                dispatchNewList(retypedArr);
            }
        }
    }, [searchText, searchLock]);

    /** Locks us into searching mode and caches the previous list, if cacheMode on */
    const acquireLock = useCallback(() => {
        if (cacheMode) {
            setCachedPatientInfoHead(currWorkingList);
        }

        setSearchLock(true);
        notifyLockChange?.(true);
    }, [cacheMode, currWorkingList]);

    /** Releases the lock, clears the search bar (if not already cleared) and dispatches the cached list, if cacheMode on */
    const releaseLock = useCallback(() => {
        if (cacheMode) {
            dispatchNewList(cachedPatientInfoHead);
        } else {
            dispatchNewList(fullBaseList);
        }

        setSearchText("");
        setSearchLock(false);
        notifyLockChange?.(false);
    }, [cacheMode, cachedPatientInfoHead, fullBaseList]);

    /**
     * When we start searching, cache the patient info head.
     * When we stop searching, revert back to the cached patient info head.
     * Control the search lock respectively.
     */
    useEffect(() => {
        if (!searchLock && prevSearchText === "" && searchText !== "") {
            acquireLock();
        } else if (searchLock && prevSearchText !== "" && searchText === "") {
            releaseLock();
        }
    }, [searchText, prevSearchText]);

    /**
     * Alternatively, if the forceReleaseLock prop is updated, we'll release the lock.
     */
    useEffect(() => {
        if (forceReleaseLock) {
            // check it's not undefined or null before releasing the lock
            releaseLock();
        }
    }, [forceReleaseLock]);

    return (
        <input
            type='search'
            id='search'
            name='search'
            placeholder='Search'
            data-testid={"search-bar-test-id"}
            onChange={(e) => setSearchText(e.target.value)}
            {...props}
        />
    );
}
