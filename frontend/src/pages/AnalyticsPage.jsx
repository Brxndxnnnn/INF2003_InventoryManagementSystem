import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api.js";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LineChart, Line,
} from "recharts";

const AnalyticsPage = () => {
    const [analyticsType, setAnalyticsType] = useState("");
    const [shops, setShops] = useState([]);
    const [selectedShop, setSelectedShop] = useState("");
    const [chartData, setChartData] = useState([]);
    const [activeType, setActiveType] = useState(""); 
    const user = JSON.parse(sessionStorage.getItem("user"));
    const userId = user.user_id;

    useEffect(() => {
        const fetchShops = async () => {
            try {
            const { data } = await api.get(`/api/shop/user/${userId}`);
            setShops(data);
            } catch (err) {
            console.error("Error fetching shops:", err);
            }
        };
        if (userId) fetchShops();
    }, [userId]);

    const handleGenerate = async () => {
        if (!analyticsType) {
            alert("Please select an analytics type first.");
            return;
        }

        try {
            let endpoint = "";

            switch (analyticsType) {
            case "inventoryValue": 
                endpoint = selectedShop
                ? `/api/analytics/shop/${userId}/inventory-value?shops=${selectedShop}`
                : `/api/analytics/shop/${userId}/inventory-value`;
                break;
            case "monthlyOrders":
                endpoint = selectedShop
                ? `/api/analytics/shop/${userId}/monthly-orders?shops=${selectedShop}`
                : `/api/analytics/shop/${userId}/monthly-orders`;
                break;
            case "lowStock":
                endpoint = selectedShop
                ? `/api/analytics/shop/${userId}/low-stock?shops=${selectedShop}`
                : `/api/analytics/shop/${userId}/low-stock`;
                break;
            default:
                return;
            }

            const { data } = await api.get(endpoint);
            setChartData(data);
            setActiveType(analyticsType);
        } catch (err) {
            console.error("Error generating analytics:", err);
            alert("Failed to fetch analytics data.");
        }
    };

    return (
        <div>
        <Navbar />
        <div className="container2">
            <div
            className="header-row"
            style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "20px" }}
            >
            <h3>Generate Analytics:</h3>

            <select value={analyticsType} onChange={(e) => setAnalyticsType(e.target.value)}>
                <option value="">Select Type</option>
                <option value="inventoryValue">Inventory Value by Category</option>
                <option value="monthlyOrders">Monthly Order Count Trend</option>
                <option value="lowStock">Low Stock Products</option>
            </select>

            <span>for</span>
            <select value={selectedShop} onChange={(e) => setSelectedShop(e.target.value)}>
                <option value="">All Shops</option>
                {shops.map((shop) => (
                <option key={shop.shop_id} value={shop.shop_id}>
                    {shop.shop_name}
                </option>
                ))}
            </select>

            <button className="submit-btn" onClick={handleGenerate}>
                Generate
            </button>
            </div>
            <hr />
            {/* Chart Section */}
            <div style={{ marginTop: "30px", height: "400px", minWidth: "300px", minHeight: "300px" }}>
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                {activeType === "inventoryValue" ? (
                    //Inventory Value by Category
                    <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {[...new Set(chartData.map((row) => row.shop_name))].map((shop, index) => (
                        <Bar
                        key={shop}
                        dataKey={(entry) => (entry.shop_name === shop ? entry.total_value : 0)}
                        name={shop}
                        fill={["#0077b6", "#90e0ef", "#0096c7", "#48cae4", "#00b4d8"][index % 5]}
                        barSize={40}
                        />
                    ))}
                    </BarChart>
                ) : activeType === "monthlyOrders" ? (
                    //Monthly Order Count Trend
                    <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {[...new Set(chartData.map((row) => row.shop_name))].map((shop, index) => (
                        <Line
                        key={shop}
                        type="monotone"
                        dataKey={(entry) => (entry.shop_name === shop ? entry.order_count : null)}
                        name={shop}
                        stroke={["#0077b6", "#90e0ef", "#0096c7", "#48cae4", "#00b4d8"][index % 5]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        />
                    ))}
                    </LineChart>
                ) : activeType === "lowStock" ? (
                    //low Stock Products
                    <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="product_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {[...new Set(chartData.map((row) => row.shop_name))].map((shop, index) => (
                        <Bar
                        key={shop}
                        dataKey={(entry) => (entry.shop_name === shop ? entry.current_stock : 0)}
                        name={shop}
                        fill={["#0077b6", "#90e0ef", "#0096c7", "#48cae4", "#00b4d8"][index % 5]}
                        barSize={35}
                        />
                    ))}
                    </BarChart>
                ) : null}
                </ResponsiveContainer>
            ) : (
                <p>No data available. Generate analytics to see results.</p>
            )}
            </div>

        </div>
        </div>
    );
    };

export default AnalyticsPage;