import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ShopCard from "../components/ShopCard";
import AddShopSupplierModal from "../components/AddShopSupplierModal.jsx";
import api from "../api.js";

const HomePage = () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const role = user?.user_type;
    const [items, setItems] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const fetchData = async () => {
        try {
            let endpoint = "";

            if (role === "shop") {
                endpoint = `/api/shop/user/${user.user_id}`;
            } 
            else if (role === "supplier") {
                endpoint = `/api/supplier/user/${user.user_id}`;
            } 
            else {
                console.warn("Unknown role:", role);
                return;
            }
            const { data } = await api.get(endpoint);
            setItems(data);
            console.log(`Fetched ${role === "shop" ? "items" : "suppliers"} successfully:`, data);
        } 
        catch (err) {
            console.error("Error fetching data:", err.response?.data?.message || err.message);
        }
    };

    useEffect(() => {if (user?.user_id && role) fetchData();}, [user?.user_id, role]);

    const handleShopCreated = (newShop) => {
        setItems((prev) => [...prev, newShop]);
        setShowModal(false);
        fetchData();
    };

  return (
    <div>
      <Navbar />
      <div className="container2">
        <div className="header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>{role === "supplier" ? "My Suppliers" : "My Shops"}</h2>
          <button onClick={() => setShowModal(true)} className="add-btn">
            + Add {role === "supplier" ? "Supplier" : "Shop"}
          </button>
        </div>

        <div className="shop-grid">
          {items.length > 0 ? (
            items.map((shop) => <ShopCard key={shop.shop_id} shop={shop} role={role} />)
          ) : (
            <p>No {role === "supplier" ? "suppliers" : "shops"} found.</p>
          )}
        </div>
      </div>

      {showModal && (
        <AddShopSupplierModal
          userId={user.user_id}
          role={role}
          onClose={() => setShowModal(false)}
          onSuccess={handleShopCreated}
        />
      )}
    </div>
  );
};

export default HomePage;