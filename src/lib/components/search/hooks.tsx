import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A signal that can be used to trigger updates when a function is called.
 */
export type Signal = number;

/**
 * Getter: the signal that you can tie to a useEffect hook or some other reactive function.
 * Setter: the function that you can call to trigger the signal.
 */
type ReturnType = [Signal, () => void];

/**
 * An event signal hook that can be used to trigger updates when a function is called.
 */
export function useEventSignal(): ReturnType {
	const [signal, setSignal] = useState<Signal>(0);
	const signalRef = useRef(signal);
	signalRef.current = signal;
	const signalEvent = useCallback(() => setSignal(signalRef.current + 1), []);
	return [signal, signalEvent];
}

// -----------------------------------------------------------------------------

/**
 * Custom hook that maintains the previous value of a changing React state variable.
 */
export function usePrevious<T>(value: T): T | undefined {
	// The ref object is a generic container whose current property is mutable, and can hold any value, similar to an instance property on a class
	const ref = useRef<T>();
	// Store current value in ref
	useEffect(() => {
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
function assertIsNode(e: EventTarget | null): asserts e is Node {
	if (!e || !("nodeType" in e)) {
		throw new Error(`Node expected`);
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
export function useOutsideAlerter(
	ref: React.RefObject<HTMLElement>,
	callback: () => void
) {
	useEffect(() => {
		/**
		 * Alert if clicked on outside of element
		 */
		function handleClickOutside({ target }: MouseEvent) {
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
