import TurboSearchBox from "./lib";

function App() {
    return (
        <center>
            <br />
            <br />
            <br />
            <TurboSearchBox
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
                style={{
                    width: "50%",
                }}
            />
            <br />
            <br />
            <br />
        </center>
    );
}

export default App;
