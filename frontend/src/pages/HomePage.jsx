import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ShopCard from "../components/ShopCard";
import AddShopSupplierModal from "../components/AddShopSupplierModal.jsx";
import api from "../api.js";

const HomePage = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const role = user?.user_type;
  const isSupplier = role === "supplier";

  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // UI hooks
  const title = isSupplier ? "Supplier Portal" : "Shop Portal";
  const badgeText = isSupplier ? "Logged in as SUPPLIER" : "Logged in as SHOP";
  const subtitle = isSupplier
    ? "This page displays the supplier businesses managed under your account."
    : "This page shows all shops you are responsible for.";
  const addLabel = isSupplier ? "Supplier" : "Shop";

  const fetchData = async () => {
    try {
      let endpoint = "";

      if (role === "shop") {
        endpoint = `/api/shop/user/${user.user_id}`;
      } else if (role === "supplier") {
        endpoint = `/api/supplier/user/${user.user_id}`;
      } else {
        console.warn("Unknown role:", role);
        return;
      }

      const { data } = await api.get(endpoint);
      setItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.user_id && role) fetchData();
  }, [user?.user_id, role]);

  const handleShopCreated = (newShop) => {
    setItems((prev) => [...prev, newShop]);
    setShowModal(false);
    fetchData();
  };

  return (
    <div className={`home-page ${isSupplier ? "supplier-home" : "shop-home"}`}>
      <Navbar />

      <div className="container2">
        {/* Hero */}
        <div className="home-hero">
          <div>
            <span className="role-badge">{badgeText}</span>
            <h1>{title}</h1>
            <p className="subtitle">{subtitle}</p>
          </div>
          <div className="hero-icon">{isSupplier ? "🚚" : "🏬"}</div>
        </div>

        {/* Header */}
        <div className="header-row">
          <h2>{isSupplier ? "My Owned Supplier Businesses" : "My Shops"}</h2>
          <button onClick={() => setShowModal(true)} className="add-btn">
            + Add {addLabel}
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="empty-state-card">
            <h3>{isSupplier ? "No suppliers have been added yet" : "No shops have been created yet"}</h3>

            {isSupplier ? (
              <>
                <p>This dashboard will list all suppliers that your account can order from.</p>
                <ul>
                  <li>Click “Add Supplier” to register a new supplier.</li>
                  <li>Fill in their name, contact, UEN and address.</li>
                  <li>Manage their products and incoming orders.</li>
                </ul>
              </>
            ) : (
              <>
                <p>This dashboard will show all shops/outlets under your responsibility.</p>
                <ul>
                  <li>Click “Add Shop” to create your first shop.</li>
                  <li>Define its name, location and contact details.</li>
                  <li>Manage its inventory and supplier orders.</li>
                </ul>
              </>
            )}

            <button onClick={() => setShowModal(true)} className="primary-empty-btn">
              {isSupplier ? "Add your first supplier" : "Create your first shop"}
            </button>
          </div>
        ) : (
          <div className={isSupplier ? "supplier-list" : "shop-grid"}>
            {items.map((shop) => (
              <ShopCard key={shop.shop_id || shop.supplier_id} shop={shop} role={role} />
            ))}
          </div>
        )}
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