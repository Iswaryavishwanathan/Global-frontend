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
            message: "",
            messageType: ""
        };
    }

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    fetchData = async () => {
        const { startDate, endDate } = this.state;

        if (!startDate || !endDate) {
            this.setState({ message: "Please select both start and end dates.", messageType: "error" });
            setTimeout(() => this.setState({ message: "" }), 3000);
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:8080/api/data/range?start=${startDate}&end=${endDate}`
            );

            const data = response.data || [];
            if (data.length === 0) {
                this.setState({ data, message: "No data available for the selected date.", messageType: "error" });
            } else {
                this.setState({ data, message: "✅ Data fetched successfully!", messageType: "success" });
            }

            setTimeout(() => this.setState({ message: "" }), 3000);
        } catch (error) {
            this.setState({ message: "❌ Error fetching data. Check backend connection.", messageType: "error" });
            setTimeout(() => this.setState({ message: "" }), 3000);
        }
    };

    exportToExcel = async () => {
        const { startDate, endDate } = this.state;

        if (!startDate || !endDate) {
            this.setState({ message: "Please select both start and end dates to export.", messageType: "error" });
            setTimeout(() => this.setState({ message: "" }), 3000);
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:8080/api/data/export-excel`,
                {
                    params: {
                        start: startDate,
                        end: endDate
                    },
                    responseType: "blob"
                }
            );

            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "data_report.xlsx";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            this.setState({ message: "✅ Report exported successfully!", messageType: "success" });
            setTimeout(() => this.setState({ message: "" }), 3000);
        } catch (error) {
            this.setState({ message: "❌ Error exporting data. Check backend.", messageType: "error" });
            setTimeout(() => this.setState({ message: "" }), 3000);
        }
    };

    formatDateTime = (dateTime) => {
        return dateTime ? new Date(dateTime).toLocaleString() : "N/A";
    };

    render() {
        const { data, message, messageType } = this.state;

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

                    <button onClick={this.fetchData}>Show Data</button>
                    <button onClick={this.exportToExcel} className="export-btn">Export to Excel</button>
                </div>

                {message && <p className={messageType === "success" ? "success-msg" : "error-msg"}>{message}</p>}

                {data && data.length > 0 ? (
                    <div>
                        <p><strong>Total Records: {data.length}</strong></p>
                        <table>
  <thead>
    <tr>
      <th>S.No.</th>
      <th>Date & Time</th>
      <th>Feeder Details</th>
      <th>Voltage (V)</th>
      <th>Current (A)</th>
      <th>KW</th>
      <th>KWh</th>
    </tr>
  </thead>
  <tbody>
    {data.map((item, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>{new Date(item.dateAndTime).toLocaleString()}</td>
        <td>{item.feederDetails}</td>
        <td>{(item.voltage ?? 0).toFixed(2)}</td>
        <td>{(item.current ?? 0).toFixed(2)}</td>
        <td>{(item.kw ?? 0).toFixed(2)}</td>
        <td>{(item.kwh ?? 0).toFixed(2)}</td>
      </tr>
    ))}
  </tbody>
</table>

                    </div>
                ) : (
                    <p>Please select both the start date and end date.</p>
                )}
            </div>
        );
    }
}

export default DataTable;
