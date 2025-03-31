import React, { useState } from "react";
import DataTable from "./components/DataTable";
import DailyKWhTable from "./components/DailyKWhTable";

function App() {
    const [activeTable, setActiveTable] = useState(null);

    return (
        <div className="container">
            <h1>Data Consumption Reports</h1>

            {/* Buttons to toggle tables */}
            <button onClick={() => setActiveTable(activeTable === "data" ? null : "data")}>
                Show Data Table
            </button>
            <button onClick={() => setActiveTable(activeTable === "kwh" ? null : "kwh")}>
                Show kWh Table
            </button>

            {/* Conditionally render only one table at a time */}
            {activeTable === "data" && <DataTable />}
            {activeTable === "kwh" && <DailyKWhTable />}
        </div>
    );
}

export default App;
