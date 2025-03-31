import React, { Component } from "react";
import axios from "axios";
import "./DataTable.css"; // Ensure your styles are linked properly

class DataTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: "",
            endDate: "",
            data: [],
            error: "",
            databaseSource: "All", // Default: Show all sources
            databaseSources: [], // Stores unique sources from data
        };
    }

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    fetchData = async () => {
        const { startDate, endDate } = this.state;

        if (!startDate || !endDate) {
            this.setState({ error: "Please select both start and end dates." });
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:8080/api/data/range?startDate=${startDate}&endDate=${endDate}`
            );

            const data = response.data;
            const databaseSources = ["All", ...new Set(data.map(item => item.databaseSource || "Unknown"))];

            this.setState({ data, databaseSources, error: "" });
        } catch (error) {
            this.setState({ error: "Error fetching data. Check backend connection." });
        }
    };

    exportToExcel = async () => {
        const { startDate, endDate, databaseSource } = this.state;
    
        if (!startDate || !endDate) {
            this.setState({ error: "Please select both start and end dates." });
            return;
        }
    
        try {
            const response = await axios.get(
                `http://localhost:8080/api/data/export-excel`,
                {
                    params: { startDate, endDate, databaseSource },
                    responseType: "blob", // Important for file download
                }
            );
    
            // ✅ Create a blob URL & download file
            const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "data_report.xlsx";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
    
        } catch (error) {
            this.setState({ error: "Error exporting data." });
        }
    };
    
    formatDateTime = (dateTime) => {
        return dateTime ? new Date(dateTime).toLocaleString() : "N/A";
    };

    render() {
        const { data, databaseSource, databaseSources } = this.state;

        // Filter data based on selected database source
        const filteredData = databaseSource === "All"
            ? data
            : data.filter(item => (item.databaseSource || "Unknown") === databaseSource);

        return (
            <div className="container">
                <h2>Data Table</h2>
                <div className="input-container">
                    <label htmlFor="startDate">Start Date:</label>
                    <input
                        type="datetime-local"
                        id="startDate"
                        name="startDate"
                        value={this.state.startDate}
                        onChange={this.handleChange}
                        required
                    />

                    <label htmlFor="endDate">End Date:</label>
                    <input
                        type="datetime-local"
                        id="endDate"
                        name="endDate"
                        value={this.state.endDate}
                        onChange={this.handleChange}
                        required
                    />

                    <button onClick={this.fetchData}>Fetch Data</button>
                    <button onClick={this.exportToExcel} className="export-btn">Export to Excel</button>

                    {databaseSources.length > 0 && (
                        <div>
                            <label htmlFor="databaseSource">Database Source:</label>
                            <select
                                id="databaseSource"
                                name="databaseSource"
                                value={databaseSource}
                                onChange={this.handleChange}
                            >
                                {databaseSources.map((source, index) => (
                                    <option key={index} value={source}>{source}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {this.state.error && <p className="error">{this.state.error}</p>}

                <p><strong>Total Records: {filteredData.length}</strong></p>

                <table>
                    <thead>
                        <tr>
                            <th>Date & Time</th>
                            <th>Millitm</th>
                            <th>Tag Index</th>
                            <th>Tag Name</th>
                            <th>Val</th>
                            <th>Status</th>
                            <th>Marker</th>
                            <th>Database Source</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((item, index) => (
                                <tr key={index}>
                                    <td>{this.formatDateTime(item.dateAndTime)}</td>
                                    <td>{item.millitm}</td>
                                    <td>{item.tagIndex}</td>
                                    <td>{item.tagName || "N/A"}</td>
                                    <td>{item.val}</td>
                                    <td>{item.status.trim() || "N/A"}</td>
                                    <td>{item.marker.trim() || "N/A"}</td>
                                    <td>{item.databaseSource || "Unknown"}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8">No data available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default DataTable;
