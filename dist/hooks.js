"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useEventSignal = useEventSignal;
exports.useOutsideAlerter = useOutsideAlerter;
exports.usePrevious = usePrevious;
require("core-js/modules/web.dom-collections.iterator.js");
var _react = require("react");
/**
 * An event signal hook that can be used to trigger updates when a function is called.
 */
function useEventSignal() {
  const [signal, setSignal] = (0, _react.useState)(0);
  const signalRef = (0, _react.useRef)(signal);
  signalRef.current = signal;
  const signalEvent = (0, _react.useCallback)(() => setSignal(signalRef.current + 1), []);
  return [signal, signalEvent];
}

// -----------------------------------------------------------------------------

/**
 * Custom hook that maintains the previous value of a changing React state variable.
 */
function usePrevious(value) {
  // The ref object is a generic container whose current property is mutable, and can hold any value, similar to an instance property on a class
  const ref = (0, _react.useRef)();
  // Store current value in ref
  (0, _react.useEffect)(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes
  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

// -----------------------------------------------------------------------------

/**
 * Utility function to assert the target is a node
 * Lifted straight from https://stackoverflow.com/questions/71193818/react-onclick-argument-of-type-eventtarget-is-not-assignable-to-parameter-of-t
 */
function assertIsNode(e) {
  if (!e || !("nodeType" in e)) {
    throw new Error("Node expected");
  }
}

/**
 * Hook that alerts clicks outside of the passed ref
 * Modified from https://stackoverflow.com/a/42234988/11760521
 * 
 * Use like this:
 * ```
 *  const notifyClickOutside = useRef<HTMLDivElement>(null);
    useOutsideAlerter(notifyClickOutside, () => {
        // DO SOMETHING
    });
	return (
		<Body ref={notifyClickOutside}>
            ...
        </Body>
    )
 * ```
 */
function useOutsideAlerter(ref, callback) {
  (0, _react.useEffect)(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(_ref) {
      let {
        target
      } = _ref;
      assertIsNode(target);
      if (ref.current && !ref.current.contains(target)) {
        callback();
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}