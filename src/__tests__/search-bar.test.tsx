import { cleanup, render, screen } from "@testing-library/react";
import maleNames from "./fake-data/names-male.json";
import femaleNames from "./fake-data/names-female.json";
import surnames from "./fake-data/names-surnames.json";
import { act, Simulate } from "react-dom/test-utils";
import TurboSearchBox from "index";

// ----- Constants -----

export const TEST_ID = "search-bar-test-id";

// ----- Helper Functions -----

/**
 * Check the equality of two arrays of objects.
 */
const arraysEqual = <T extends { [key: string]: number | string }>(
    a: T[],
    b: T[]
) => {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        // compare the key-value pairs of each object
        for (const key in a[i]) {
            if (a[i][key] !== b[i][key]) {
                return false;
            }
        }
    }
    return true;
};

// ----- Generate Fake Data -----

const possibleMaleNames = JSON.parse(JSON.stringify(maleNames)).data;
const possibleFemaleNames = JSON.parse(JSON.stringify(femaleNames)).data;
const possibleSurnames = JSON.parse(JSON.stringify(surnames)).data;

/** Creates a fake name FIRST LAST */
const createFakeName = () => {
    const name = {
        first: possibleMaleNames[
            Math.floor(Math.random() * possibleMaleNames.length)
        ],
        last: possibleSurnames[
            Math.floor(Math.random() * possibleSurnames.length)
        ],
    };
    if (Math.random() > 0.5) {
        name.first =
            possibleFemaleNames[
                Math.floor(Math.random() * possibleFemaleNames.length)
            ];
    }
    return `${name.first} ${name.last}`;
};

/**
 * Creates a fake substring of a name for testing purposes.
 * @param findable - If true, the substring will be found in the names of one of the elements in the list.
 * @param list - The list of names to search through.
 * @returns A string that is a substring (of length between 1 and the length of the name) of a name in the list.
 */
const createFakeSubstring = <T extends { name: string }[]>(
    findable: boolean,
    list: T
) => {
    const name = list[Math.floor(Math.random() * list.length)].name;

    // substring can start at any index between 0 and the length of the name,
    // and can end at any index between 1 and the length of the name
    const start = Math.floor(Math.random() * name.length);
    const end = Math.floor(Math.random() * (name.length - start)) + start + 1;
    const substring = name.substring(start, end);

    if (findable) {
        return substring;
    } else {
        return substring + "asf"; // lol
    }
};

/** Generate a full list of objects for testing */
const generateTestList = (n: number) => {
    const list = [];
    for (let i = 0; i < n; i++) {
        list.push({
            id: i,
            name: createFakeName(),
        });
    }
    return list;
};

/** Generate a sublist of a given list for testing */
const generateRandomSublist = <T,>(list: T[], n: number) => {
    const sublist = [];
    for (let i = 0; i < n; i++) {
        sublist.push(list[Math.floor(Math.random() * list.length)]);
    }
    return sublist;
};

// ----- Testable Data and Tester Functions -----

/**
 * Generate an immutable list, sublist, and searchText for testing purposes.
 *
 * @param searchShouldBePresent - If true, the searchText will be found in the name of an element in the full list.
 * @param fullSize - The size of the full list (defaults to 100).
 * @param subSize - The size of the sublist (defaults to 25).
 */
export const getTestData = (
    searchShouldBePresent = true,
    fullSize = 100,
    subSize = 25
) => {
    const fullBaseList = generateTestList(fullSize);
    const currWorkingList = generateRandomSublist<typeof fullBaseList[0]>(
        fullBaseList,
        subSize
    );

    const searchText = createFakeSubstring(searchShouldBePresent, fullBaseList);

    return { fullBaseList, currWorkingList, searchText } as const;
};

/**
 * Validate that a search was performed correctly for testing purposes.
 * Criteria: given a searchText,
 * 1. If the searchText is found in the name of an element in the baseList, then the element should be in the searchedList.
 *
 * @param baseList - The list of elements to search through.
 * @param searchedList - The list of elements that were found.
 * @param searchText - The text that was searched for.
 */
const validateSearch = <T extends { name: string }>(
    baseList: T[],
    searchedList: T[],
    searchText: string
): boolean => {
    // generate a regex to search for the searchText
    const searchRegex = new RegExp(searchText, "i");
    // filter the baseList for elements that match the regex (contains the searchText)
    const found = baseList.filter((element) => searchRegex.test(element.name));

    // check that the found elements are in the searchedList
    found.forEach((element) => {
        // search for the element in the searchedList
        const foundInSearchedList = searchedList.find(
            (searchedElement) => searchedElement.name === element.name
        );

        // if the element is not found, return false
        if (!foundInSearchedList) {
            return false;
        }
    });

    // if we made it this far, return true
    return true;
};

/** Generates an array of test runs */
const generateTestRuns = (n: number) => {
    const testRuns = [];
    for (let i = 0; i < n - 1; i++) {
        testRuns.push(true);
    }
    testRuns.push(false);
    return testRuns;
};

// ----- Tests -----

/**
 * Basic Smoke Test: Test that the search bar renders without crashing.
 */
it("renders without crashing", () => {
    const { fullBaseList, currWorkingList } = getTestData();

    render(
        <TurboSearchBox
            dispatchNewList={jest.fn()}
            sortBehavior={{
                keys: ["name"],
            }}
            lockBehavior={{}}
            info={{
                fullBaseList: fullBaseList,
                currWorkingList: currWorkingList,
            }}
        />
    );
});

/**
 * Test that the search bar performs a search correctly.
 *
 * Variations:
 * - searchText is present or absent in list
 */
for (const present of generateTestRuns(100)) {
    it(`performs a search correctly when searchText is ${
        present ? "present" : "absent"
    } in list`, () => {
        const { fullBaseList, currWorkingList, searchText } =
            getTestData(present);

        const mockDispatch = jest.fn();

        // render the search bar
        render(
            <>
                <TurboSearchBox
                    dispatchNewList={mockDispatch}
                    sortBehavior={{
                        keys: ["name"],
                    }}
                    lockBehavior={{}}
                    info={{
                        fullBaseList: fullBaseList,
                        currWorkingList: currWorkingList,
                    }}
                />
            </>
        );

        // type-check and get the input
        const input = screen.getByTestId(TEST_ID) as HTMLInputElement;

        // check that the input value is empty
        expect(input.value).toBe("");

        // type the searchText into the input
        act(() => {
            input.value = searchText;
            Simulate.change(input);
        });

        // check that the input value is the searchText
        expect(input.value).toBe(searchText);

        // check that the dispatch function was called
        expect(mockDispatch).toHaveBeenCalledTimes(1);

        // check that the search was performed correctly
        expect(
            validateSearch(
                fullBaseList,
                mockDispatch.mock.calls[0][0],
                searchText
            )
        ).toBe(true);
    });
}

/**
 * Test that the search bar caches and releases the search results correctly.
 *
 * Variations:
 * - searchText is present or absent in list
 */
for (const present of generateTestRuns(2)) {
    it(`has correct cache and lock behavior`, () => {
        const { fullBaseList: fakeFullList, ...rest } = getTestData(present);
        const fakeCachableList = generateTestList(5);

        const mockDispatchNewList = jest.fn();
        const mockNotifyLockChange = jest.fn();

        // render the search bar
        render(
            <>
                <TurboSearchBox
                    dispatchNewList={mockDispatchNewList}
                    sortBehavior={{
                        keys: ["name"],
                    }}
                    lockBehavior={{
                        cacheMode: true,
                        notifyLockChange: mockNotifyLockChange,
                    }}
                    info={{
                        fullBaseList: fakeFullList,
                        currWorkingList: fakeCachableList,
                    }}
                />
            </>
        );

        // type-check and get the input
        const input = screen.getByTestId(TEST_ID) as HTMLInputElement;

        // check that the lock has not changed yet, and that dispatch was not called
        expect(mockNotifyLockChange).toHaveBeenCalledTimes(0);
        expect(mockDispatchNewList).toHaveBeenCalledTimes(0);

        // type the searchText into the input
        act(() => {
            input.value = rest.searchText;
            Simulate.change(input);
        });

        // check that the lock has changed, to now be locked, that the dispatch was called, and that the dispatched value is NOT fakeCachableList
        expect(mockNotifyLockChange).toHaveBeenCalledTimes(1);
        expect(mockNotifyLockChange.mock.calls[0][0]).toBe(true);
        expect(mockDispatchNewList).toHaveBeenCalledTimes(1);
        expect(
            arraysEqual(mockDispatchNewList.mock.calls[0][0], fakeCachableList)
        ).toBe(false);

        // remove the searchText from the input
        act(() => {
            input.value = "";
            Simulate.change(input);
        });

        // check that the lock has changed again, and to now be unlocked, and that the dispatch was called at least once more, and that the dispatched value IS fakeCachableList
        expect(mockNotifyLockChange).toHaveBeenCalledTimes(2);
        expect(mockNotifyLockChange.mock.calls[1][0]).toBe(false);
        expect(mockDispatchNewList.mock.calls.length > 1).toBe(true);
        expect(
            arraysEqual(
                mockDispatchNewList.mock.calls[
                    mockDispatchNewList.mock.calls.length - 1
                ][0],
                fakeCachableList
            )
        ).toBe(true);
    });
}
