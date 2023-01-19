"use strict";

require("core-js/modules/es.weak-map.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = TurboSearchBox;
require("core-js/modules/web.dom-collections.iterator.js");
var _fuzzysort = _interopRequireDefault(require("fuzzysort"));
var _react = _interopRequireWildcard(require("react"));
var _hooks = require("./hooks");
require("./pico.css");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
// import css

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
function TurboSearchBox(props) {
  const {
    dispatchNewList,
    sortBehavior,
    lockBehavior,
    info
  } = props;
  /** Destruct behavior props */
  const {
    keys,
    preProcess,
    postProcess
  } = sortBehavior;
  /** Destruct info props */
  const {
    fullBaseList,
    currWorkingList
  } = info;
  /** Destruct lock props */
  const {
    cacheMode,
    notifyLockChange,
    forceReleaseLock
  } = lockBehavior;

  /** Used to control search bar text */
  const [searchText, setSearchText] = (0, _react.useState)("");

  /**
   * Search Bar Lock
   * When the lock is true, we're in searching mode. Filters are disabled. We'll cache the previous patientinfohead.
   * When the lock is false, we are no longer searching. Filters are enabled. We'll offload the cache into the actual list.
   */
  const [searchLock, setSearchLock] = (0, _react.useState)(false);

  /**
   * Cache the patient info head when we start searching
   * so we can revert back to the original list when we're done.
   */
  const [cachedPatientInfoHead, setCachedPatientInfoHead] = (0, _react.useState)([]);

  /** Keep track of the previous Search Text */
  const prevSearchText = (0, _hooks.usePrevious)(searchText);

  /**
   * When the search text changes, and provided the lock is acquired, update the patient info head.
   * This should only happen when the search lock is acquired.
   */
  (0, _react.useEffect)(() => {
    if (searchLock) {
      if (preProcess && postProcess) {
        const preprocessedArr = preProcess(fullBaseList);
        const sortedArr = _fuzzysort.default.go(searchText, preprocessedArr, {
          keys: keys,
          all: true
        });
        const retypedArr = sortedArr.map(patient => patient.obj);
        const postprocessedArr = postProcess(retypedArr);
        dispatchNewList(postprocessedArr);
      } else {
        const sortedArr = _fuzzysort.default.go(searchText, fullBaseList, {
          keys: keys,
          all: true
        });
        const retypedArr = sortedArr.map(patient => patient.obj);
        dispatchNewList(retypedArr);
      }
    }
  }, [searchText, searchLock]);

  /** Locks us into searching mode and caches the previous list, if cacheMode on */
  const acquireLock = (0, _react.useCallback)(() => {
    if (cacheMode) {
      setCachedPatientInfoHead(currWorkingList);
    }
    setSearchLock(true);
    notifyLockChange === null || notifyLockChange === void 0 ? void 0 : notifyLockChange(true);
  }, [cacheMode, currWorkingList]);

  /** Releases the lock, clears the search bar (if not already cleared) and dispatches the cached list, if cacheMode on */
  const releaseLock = (0, _react.useCallback)(() => {
    if (cacheMode) {
      dispatchNewList(cachedPatientInfoHead);
    } else {
      dispatchNewList(fullBaseList);
    }
    setSearchText("");
    setSearchLock(false);
    notifyLockChange === null || notifyLockChange === void 0 ? void 0 : notifyLockChange(false);
  }, [cacheMode, cachedPatientInfoHead, fullBaseList]);

  /**
   * When we start searching, cache the patient info head.
   * When we stop searching, revert back to the cached patient info head.
   * Control the search lock respectively.
   */
  (0, _react.useEffect)(() => {
    if (!searchLock && prevSearchText === "" && searchText !== "") {
      acquireLock();
    } else if (searchLock && prevSearchText !== "" && searchText === "") {
      releaseLock();
    }
  }, [searchText, prevSearchText]);

  /**
   * Alternatively, if the forceReleaseLock prop is updated, we'll release the lock.
   */
  (0, _react.useEffect)(() => {
    if (forceReleaseLock) {
      // check it's not undefined or null before releasing the lock
      releaseLock();
    }
  }, [forceReleaseLock]);
  return /*#__PURE__*/_react.default.createElement("input", {
    type: "search",
    name: "search",
    placeholder: "Search",
    "data-testid": "search-bar-test-id",
    onChange: e => setSearchText(e.target.value),
    style: props.style
  });
}