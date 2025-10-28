import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import Navbar from "../components/Navbar";
import api from "../api.js";
import AddOrderModal from "../components/AddOrderModal";
import ShopOrderCard from "../components/ShopOrderCard.jsx";
import InventoryCard from "../components/InventoryCard.jsx";

const ShopPage = () => {
    const { id } = useParams();
    const [shop, setShop] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [orders, setOrders] = useState([]);
    const [orderItems, setOrderItems] = useState([]);
    const [showOrderModal, setShowOrderModal] = useState(false);

    const fetchShop = async () => {
        const { data } = await api.get(`/api/shop/${id}`);
        setShop(data);
    };

    const fetchInventory = async () => {
        const { data } = await api.get(`/api/shop-inventory/shop/${id}`);
        setInventory(data);
    };

    const fetchOrders = async () => {
        const { data } = await api.get(`/api/order/shop/${id}`);
        setOrders(data.map((o) => ({ ...o, expanded: false })));
    }

    // Lazy loading = fetch order items when u expand the fetch orders section
    const fetchOrderItems = async (orderId) => {
        const { data } = await api.get(`/api/order-item/${orderId}`);
        setOrderItems((prev) => ({...prev, [orderId]: data,}));
    };

    useEffect(() => {if (id) fetchShop(); fetchOrders(); fetchInventory();}, [id]);

    const handleToggleOrder = (orderId) => {
    setOrders((prev) =>
        prev.map((o) =>
        o.order_id === orderId ? { ...o, expanded: !o.expanded } : o
        )
    );

    if (!orderItems[orderId]) {
        fetchOrderItems(orderId);
    }
    };

    const handleOrderStatus = async (orderItem, status) => {
    try {
        const endpoint = `/api/order-item/${orderItem.order_item_id}`;
        const payload = { item_status: status };

        const { data } = await api.patch(endpoint, payload);

        alert(data.message);
        fetchInventory();
        fetchOrders();
        fetchOrderItems(orderItem.order_id)
        fetchShop();

    } catch (err) {
        alert(orderItem.order_id);
    }
    };



  return (
    <div>
      <Navbar />
      <div className="container2">
        <h2>{shop.shop_name}</h2>
        <p><strong>Address:</strong> {shop.shop_address || "N/A"}</p>
        <p><strong>Contact:</strong> {shop.shop_contact_number || "N/A"}</p>
        <p><strong>Email:</strong> {shop.shop_email || "N/A"}</p>
        <p><strong>UEN:</strong> {shop.shop_uen || "N/A"}</p>
        <hr />

        <div className="header-row" style={{ display: "flex", justifyContent: "space-between", alignProducts: "center" }}>
            <h2>Inventory</h2>
        </div>
        <div className="shop-grid">
        {inventory.length > 0 ? (
            inventory.map((inventory) => <InventoryCard key={inventory.shop_inventory_id} inventory={inventory}/>)
        ) : (
            <p>No inventory records found.</p>
        )}
        </div>

        <hr />

        <div className="header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Orders</h2>
          <button onClick={() => setShowOrderModal(true)} className="add-btn">+ Order Product</button>
        </div>

        <div className="orders-section">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.order_id} style={{ border: "1px solid #ccc", borderRadius: "8px", marginBottom: "10px", overflow: "hidden" }}>
                <div
                  onClick={() => handleToggleOrder(order.order_id)}
                  style={{
                    background: "#f7f7f7",
                    padding: "12px 16px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <strong>Order #{order.order_id}</strong> — Total: ${order.total_price}<br />
                    <small>Created: {new Date(order.created_at).toLocaleString()}</small>
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: "bold" }}>{order.expanded ? "−" : "+"}</div>
                </div>

                {order.expanded && (
                  <div className="shop-grid" style={{padding: "10px 16px", borderTop: "1px solid #ddd" }}>
                    {orderItems[order.order_id] ? (
                      orderItems[order.order_id].length > 0 ? (
                        orderItems[order.order_id].map((orderItem) => (
                          <ShopOrderCard key={orderItem.order_item_id} order={orderItem} onDelivered={() => handleOrderStatus(orderItem, "delivered")} />
                        ))
                      ) : (
                        <p>No order items found.</p>
                      )
                    ) : (
                      <p>Loading...</p>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No orders yet.</p>
          )}
        </div>
      </div>

      {showOrderModal && <AddOrderModal shopId={id} onClose={() => setShowOrderModal(false)} onSuccess={() => fetchOrders()} />}
    </div>
  );
};

export default ShopPage