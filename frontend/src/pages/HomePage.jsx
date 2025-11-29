import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ShopCard from "../components/ShopCard";
import AddShopSupplierModal from "../components/AddShopSupplierModal.jsx";
import api from "../api.js";

const HomePage = () => {
  const storedUser = sessionStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const role = user?.user_type; // "shop" or "supplier"
  const isSupplier = role === "supplier";

  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    try {
      if (!user || !role) return;

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
    if (user?.user_id && role) {
      fetchData();
    }
  }, [user?.user_id, role]);

  const handleCreated = (newItem) => {
    setItems((prev) => [...prev, newItem]);
    setShowModal(false);
    fetchData();
  };

  const title = isSupplier ? "Supplier Portal" : "Shop Portal";
  const badgeText = isSupplier ? "Logged in as SUPPLIER" : "Logged in as SHOP";
  const subtitle = isSupplier
  ? "This page displays the supplier businesses managed under your account."
  : "This page shows all shops you are responsible for.";
  const addLabel = isSupplier ? "Supplier" : "Shop";

  return (
    <div className={`home-page ${isSupplier ? "supplier-home" : "shop-home"}`}>
      <Navbar />
      <div className="container2">
        {/* Top banner clearly showing role */}
        <div className="home-hero">
          <div>
            <span className="role-badge">{badgeText}</span>
            <h1>{title}</h1>
            <p className="subtitle">{subtitle}</p>
          </div>
          <div className="hero-icon">
            {isSupplier ? "🚚" : "🏬"}
          </div>
        </div>

        {/* Header row + action button */}
        <div className="header-row">
          <h2>
            {isSupplier ? "My Owned Supplier Businesses" : "My Shops"}
          </h2>
          <button onClick={() => setShowModal(true)} className="add-btn">
            + Add {addLabel}
          </button>
        </div>

        {/* CONTENT */}
        {items.length === 0 ? (
          // EMPTY STATE: different for shop vs supplier
          <div className="empty-state-card">
            <h3>
              {isSupplier
                ? "No suppliers have been added yet"
                : "No shops have been created yet"}
            </h3>
            {isSupplier ? (
              <>
                <p>
                  This dashboard will list all suppliers that your account can
                  order from.
                </p>
                <ul>
                  <li>Click “Add Supplier” to register a new supplier.</li>
                  <li>Fill in their name, contact, UEN and address.</li>
                  <li>
                    After that, you can manage their products and incoming
                    orders.
                  </li>
                </ul>
              </>
            ) : (
              <>
                <p>
                  This dashboard will show all shops/outlets under your
                  responsibility.
                </p>
                <ul>
                  <li>Click “Add Shop” to create your first shop.</li>
                  <li>Define its name, location and contact details.</li>
                  <li>
                    Then you can manage its inventory and orders to suppliers.
                  </li>
                </ul>
              </>
            )}
            <button
              onClick={() => setShowModal(true)}
              className="primary-empty-btn"
            >
              {isSupplier ? "Add your first supplier" : "Create your first shop"}
            </button>
          </div>
        ) : (
          // NON-EMPTY LIST (still slightly different styling by role via CSS)
          <div className={isSupplier ? "supplier-list" : "shop-grid"}>
            {items.map((item) => (
              <ShopCard
                key={item.shop_id || item.supplier_id}
                shop={item}
                role={role}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AddShopSupplierModal
          userId={user.user_id}
          role={role}
          onClose={() => setShowModal(false)}
          onSuccess={handleCreated}
        />
      )}
    </div>
  );
};

export default HomePage;
