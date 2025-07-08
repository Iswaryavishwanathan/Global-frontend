import React, { Component } from "react";
import axios from "axios";
import "./DataTable.css";

class DailyKWhTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startDateTime: "",
            endDateTime: "",
            data: [],
            message: "",
            messageType: "",
        };
    }

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    fetchData = async () => {
        const { startDateTime, endDateTime } = this.state;

        if (!startDateTime || !endDateTime) {
            this.setState({ message: "Please select both start and end datetime.", messageType: "error" });
            setTimeout(() => this.setState({ message: "" }), 3000);
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8080/api/data/daily`, {
                params: {
                    start: startDateTime,
                    end: endDateTime
                }
            });

            if (response.data.length === 0) {
                this.setState({ message: "No data available for the selected range.", messageType: "error", data: [] });
            } else {
                this.setState({ data: response.data, message: "Data fetched successfully!", messageType: "success" });
            }

            setTimeout(() => this.setState({ message: "" }), 3000);
        } catch (error) {
            this.setState({ message: "Error fetching data. Check backend connection.", messageType: "error", data: [] });
            setTimeout(() => this.setState({ message: "" }), 3000);
        }
    };

    exportExcel = async () => {
        const { startDateTime, endDateTime } = this.state;

        if (!startDateTime || !endDateTime) {
            this.setState({ message: "Please select both start and end datetime to export.", messageType: "error" });
            setTimeout(() => this.setState({ message: "" }), 3000);
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:8080/api/data/export-consumption`,
                {
                    params: { start: startDateTime, end: endDateTime },
                    responseType: "blob"
                }
            );

            const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `KWh_Consumption_Report_${startDateTime}_to_${endDateTime}.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            this.setState({ message: "✅ Report exported successfully!", messageType: "success" });
            setTimeout(() => this.setState({ message: "" }), 3000);
        } catch (error) {
            this.setState({ message: "Error exporting Excel report.", messageType: "error" });
            setTimeout(() => this.setState({ message: "" }), 3000);
        }
    };

    formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return "-";
        return new Date(dateTimeString).toLocaleString();
    };

    render() {
        const { data, startDateTime, endDateTime, message, messageType } = this.state;

        return (
            <div className="container">
                <h2>kWh Consumption Table</h2>

                <div className="input-container">
                    <label htmlFor="startDateTime">Start DateTime:</label>
                    <input
                        type="datetime-local"
                        id="startDateTime"
                        name="startDateTime"
                        value={startDateTime}
                        onChange={this.handleChange}
                        required
                    />

                    <label htmlFor="endDateTime" style={{ marginLeft: "10px" }}>End DateTime:</label>
                    <input
                        type="datetime-local"
                        id="endDateTime"
                        name="endDateTime"
                        value={endDateTime}
                        onChange={this.handleChange}
                        required
                    />

                    <button onClick={this.fetchData} style={{ marginLeft: "10px" }}>Show Data</button>
                    <button onClick={this.exportExcel} style={{ marginLeft: "10px" }}>Export Excel</button>
                </div>

                {message && <p className={messageType === "success" ? "success-msg" : "error-msg"}>{message}</p>}
                
                {data.length > 0 ? (
                    <div>
                        <p><strong>Total Records: {data.length}</strong></p>
                        <table>
                            <thead>
                                <tr>
                                    <th>S.No.</th>
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
                                        <td>{index + 1}</td>
                                        <td>{item.databaseName}</td>
                                        <td>{item.tagName}</td>
                                        <td>{this.formatDateTime(item.startDateTime)}</td>
                                        <td>{this.formatDateTime(item.endDateTime)}</td>
                                        <td>{item.startValue?.toFixed(2)}</td>
                                        <td>{item.endValue?.toFixed(2)}</td>
                                        <td>{item.consumption?.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>  
                ) : (
                    <p>Please select a date and time range.</p>
                )}
            </div>
        );
    }
}

export default DailyKWhTable;
