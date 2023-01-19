import { SearchBar } from "./lib";

function App() {
    return (
        <>
            <SearchBar
                dispatchNewList={() => {
                    /** Don't do anything! */
                }}
                sortBehavior={{
                    keys: [],
                }}
                lockBehavior={{}}
                info={{
                    fullBaseList: [],
                    currWorkingList: [],
                }}
            />
        </>
    );
}

export default App;
