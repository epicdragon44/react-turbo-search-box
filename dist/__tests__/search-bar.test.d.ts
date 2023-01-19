export declare const TEST_ID = "search-bar-test-id";
/**
 * Generate an immutable list, sublist, and searchText for testing purposes.
 *
 * @param searchShouldBePresent - If true, the searchText will be found in the name of an element in the full list.
 * @param fullSize - The size of the full list (defaults to 100).
 * @param subSize - The size of the sublist (defaults to 25).
 */
export declare const getTestData: (searchShouldBePresent?: boolean, fullSize?: number, subSize?: number) => {
    readonly fullBaseList: {
        id: number;
        name: string;
    }[];
    readonly currWorkingList: {
        id: number;
        name: string;
    }[];
    readonly searchText: string;
};
