import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import Navbar from "../components/Navbar";
import api from "../api.js";
import AddOrderModal from "../components/AddOrderModal";

const ShopPage = () => {
    const { id } = useParams();
    const user = JSON.parse(sessionStorage.getItem("user"));
    const [shop, setShop] = useState([]);
    const [showOrderModal, setShowOrderModal] = useState(false);

    const fetchData = async () => {
        try{
            const { data } = await api.get(`/api/shop/${id}`);
            setShop(data);
        }
        catch(err){
            alert("Error fetching data:", err.response?.data?.message || err.message)
        }
    };

    useEffect(() => {if (id) fetchData();}, [id]);


  return (
    <div>
        <Navbar />
        <div className="container2">
            <h2>{shop.shop_name}</h2>
            <p><strong>Address:</strong> {shop.shop_address || "N/A"}</p>
            <p><strong>Contact:</strong> {shop.shop_contact_number || "N/A"}</p>
            <p><strong>Email:</strong> {shop.shop_email || "N/A"}</p>
            <p><strong>UEN:</strong> {shop.shop_uen || "N/A"}</p>
            <hr></hr>
            <div className="header-row" style={{ display: "flex", justifyContent: "space-between", alignProducts: "center" }}>
            <h2>Inventory</h2>
            </div>
            <hr></hr>
            <div className="header-row" style={{ display: "flex", justifyContent: "space-between", alignProducts: "center" }}>
            <h2>Orders</h2>
            <button  onClick={() => setShowOrderModal(true)} className="add-btn">
                + Order Product
            </button>
            </div>
        </div>
        {showOrderModal && (<AddOrderModal shopId = {id} onClose={() => setShowOrderModal(false)}/>)}
    </div>
  )
}

export default ShopPage