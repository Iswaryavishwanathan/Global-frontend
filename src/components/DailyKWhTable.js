import React, { Component } from "react";
import axios from "axios";
import "./DataTable.css"; // Ensure styles are available

class DailyKWhTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDate: "",
            data: [],
            error: "",
        };
    }

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    fetchData = async () => {
        const { selectedDate } = this.state;

        if (!selectedDate) {
            this.setState({ error: "Please select a date." });
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:8080/api/data/daily?date=${selectedDate}`
            );
            this.setState({ data: response.data, error: "" });
        } catch (error) {
            this.setState({ error: "Error fetching data. Check backend connection." });
        }
    };

    exportExcel = async () => {
        const { selectedDate } = this.state;

        if (!selectedDate) {
            this.setState({ error: "Please select a date to export." });
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:8080/api/data/export/kwh-report?date=${selectedDate}`,
                { responseType: "blob" } // Important for binary data
            );

            // Create a Blob from the response
            const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = window.URL.createObjectURL(blob);

            // Create a link and trigger download
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `KWh_Consumption_Report_${selectedDate}.xlsx`);
            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            this.setState({ error: "Error exporting Excel report." });
        }
    };

    formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return "-";
        const date = new Date(dateTimeString);
        return date.toLocaleString(); // Converts to a readable format
    };

    render() {
        const { data, selectedDate, error } = this.state;

        return (
            <div className="container">
                <h2>Daily kWh Consumption Table</h2>

                <div className="input-container">
                    <label htmlFor="selectedDate">Select Date:</label>
                    <input
                        type="date"
                        id="selectedDate"
                        name="selectedDate"
                        value={selectedDate}
                        onChange={this.handleChange}
                        required
                    />
                    <button onClick={this.fetchData}>Fetch Data</button>
                    <button onClick={this.exportExcel} style={{ marginLeft: "10px" }}>Export Excel</button>
                </div>

                {error && <p className="error">{error}</p>}

                {data.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Panel Name</th>
                                <th>Feeder Details</th>
                                <th>Start DateTime</th>
                                <th>End DateTime</th>
                                <th>Start Value</th>
                                <th>End Value</th>
                                <th>Consumption</th>
                               
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index}>
                                     <td>{item.databaseName}</td>
                                    <td>{item.tagName}</td>
                                    <td>{this.formatDateTime(item.startDateTime)}</td>
                                    <td>{this.formatDateTime(item.endDateTime)}</td>
                                    <td>{item.startValue}</td>
                                    <td>{item.endValue}</td>
                                    <td>{item.consumption}</td>
                                   
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No data available</p>
                )}
            </div>
        );
    }
}

export default DailyKWhTable;
