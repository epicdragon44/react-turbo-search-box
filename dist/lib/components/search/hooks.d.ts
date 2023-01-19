/// <reference types="react" />
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
export declare function useEventSignal(): ReturnType;
/**
 * Custom hook that maintains the previous value of a changing React state variable.
 */
export declare function usePrevious<T>(value: T): T | undefined;
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
export declare function useOutsideAlerter(ref: React.RefObject<HTMLElement>, callback: () => void): void;
export {};
