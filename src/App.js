import React, { useState } from "react";
import DataTable from "./components/DataTable";
import DailyKWhTable from "./components/DailyKWhTable";

function App() {
    const [activeTable, setActiveTable] = useState(null);

    return (
        <div className="container">
            <h1>Energy Consumption Reports</h1>

            {/* Buttons to toggle tables */}
            <button onClick={() => setActiveTable(activeTable === "data" ? null : "data")}> Parameter </button>
            <button onClick={() => setActiveTable(activeTable === "kwh" ? null : "kwh")}> KWH Consumption </button>

            {/* Conditionally render only one table at a time */}
            {activeTable === "data" && <DataTable />}
            {activeTable === "kwh" && <DailyKWhTable />}
        </div>
    );
}

export default App;
