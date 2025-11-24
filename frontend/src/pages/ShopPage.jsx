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
  const [orderItems, setOrderItems] = useState({});
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
  };

  // Lazy loading: fetch order items only when a specific order is expanded
  const fetchOrderItems = async (orderId) => {
    const { data } = await api.get(`/api/order-item/${orderId}`);
    setOrderItems((prev) => ({ ...prev, [orderId]: data }));
  };

  useEffect(() => {
    if (id) {
      fetchShop();
      fetchOrders();
      fetchInventory();
    }
  }, [id]);

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
      fetchOrderItems(orderItem.order_id);
      fetchShop();
    } catch (err) {
      alert(orderItem.order_id);
    }
  };

  return (
    <div className="shop-page">
      <Navbar />
      <div className="container2">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Shop: {shop.shop_name || "Unknown shop"}</h1>
            <p className="subtitle">
              Track this shop&apos;s inventory and orders to suppliers.
            </p>
          </div>
          <div className="meta-badge">Internal Outlet</div>
        </div>

        {/* Shop details */}
        <div className="info-grid">
          <div className="info-item">
            <p className="label">UEN</p>
            <p className="value">{shop.shop_uen || "N/A"}</p>
          </div>
          <div className="info-item">
            <p className="label">Contact</p>
            <p className="value">{shop.shop_contact_number || "N/A"}</p>
          </div>
          <div className="info-item">
            <p className="label">Email</p>
            <p className="value">{shop.shop_email || "N/A"}</p>
          </div>
          <div className="info-item info-item-wide">
            <p className="label">Address</p>
            <p className="value">{shop.shop_address || "N/A"}</p>
          </div>
        </div>

        {/* Simple KPIs for quick glance */}
        <div className="kpi-row">
          <div className="kpi-card">
            <span className="kpi-label">Total Orders</span>
            <span className="kpi-value">{orders.length}</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Inventory Items</span>
            <span className="kpi-value">{inventory.length}</span>
          </div>
        </div>

        <hr />

        {/* Inventory section */}
        <div className="header-row">
          <h2>Inventory</h2>
        </div>

        <div className="inventory-grid">
          {inventory && inventory.length > 0 ? (
            inventory.map((item) => (
              <InventoryCard key={item.shop_inventory_id} inventory={item} />
            ))
          ) : (
            <p>No inventory records found.</p>
          )}
        </div>

        <hr />

        {/* Orders section */}
        <div className="header-row">
          <h2>Orders to suppliers</h2>
          <button
            onClick={() => setShowOrderModal(true)}
            className="add-btn"
          >
            + Order Product
          </button>
        </div>

        <div className="orders-section">
          {orders && orders.length > 0 ? (
            orders.map((order) => {
              const itemsForOrder = orderItems[order.order_id] || [];
              return (
                <div key={order.order_id} className="order-card">
                  <div
                    className="order-card-header"
                    onClick={() => handleToggleOrder(order.order_id)}
                  >
                    <div>
                      <strong>Order #{order.order_id}</strong>
                      {typeof order.total_price !== "undefined" && (
                        <> — Total: ${order.total_price}</>
                      )}
                      <br />
                      {order.created_at && (
                        <small>
                          Created:{" "}
                          {new Date(order.created_at).toLocaleString()}
                        </small>
                      )}
                    </div>
                    <div className="order-card-toggle">
                      {order.expanded ? "−" : "+"}
                    </div>
                  </div>

                  {order.expanded && (
                    <div className="order-card-body">
                      {orderItems[order.order_id] ? (
                        itemsForOrder.length > 0 ? (
                          <div className="shop-grid">
                            {itemsForOrder.map((orderItem) => (
                              <ShopOrderCard
                                key={orderItem.order_item_id}
                                orderItem={orderItem}
                                onDelivered={() =>
                                  handleOrderStatus(orderItem, "delivered")
                                }
                              />
                            ))}
                          </div>
                        ) : (
                          <p>No order items found.</p>
                        )
                      ) : (
                        <p>Loading...</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p>No orders yet.</p>
          )}
        </div>
      </div>

      {showOrderModal && (
        <AddOrderModal
          shopId={id}
          onClose={() => setShowOrderModal(false)}
          onSuccess={() => fetchOrders()}
        />
      )}
    </div>
  );
};

export default ShopPage;
