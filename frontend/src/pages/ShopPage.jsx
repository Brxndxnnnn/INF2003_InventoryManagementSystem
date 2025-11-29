import React, { useEffect, useState, useRef } from "react";
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
    const [ordersPage, setOrdersPage] = useState(1);
    const [ordersHasMore, setOrdersHasMore] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(false);
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

    const fetchOrders = async (pageNum = 1) => {
      try {
        setOrdersLoading(true);

        const { data } = await api.get(`/api/order/shop/${id}`, {
          params: { page: pageNum, limit: 5 }, // pick whatever limit you like
        });

        const rows = Array.isArray(data) ? data : [];

        if (pageNum === 1) {
          setOrders(rows.map((o) => ({ ...o, expanded: false })));
        } else {
          setOrders((prev) => [
            ...prev,
            ...rows.map((o) => ({ ...o, expanded: false })),
          ]);
        }

        // Like your product lazy load: if less than limit, no more pages
        if (rows.length < 5) setOrdersHasMore(false);
        else setOrdersHasMore(true);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setOrdersLoading(false);
      }
    };

    // fetch order items when u expand the fetch orders section
    const fetchOrderItems = async (orderId) => {
        const { data } = await api.get(`/api/order-item/${orderId}`);
        setOrderItems((prev) => ({...prev, [orderId]: data,}));
    };

    useEffect(() => {
      if (id) {
        fetchShop();
        fetchInventory();
        setOrders([]);
        setOrdersPage(1);
        setOrdersHasMore(true);
        fetchOrders(1);
      }
    }, [id]);


    useEffect(() => {
      const handleScroll = () => {
        if (!ordersHasMore || ordersLoading) return;

        const scrollPosition = window.innerHeight + window.scrollY;
        const threshold = document.body.offsetHeight - 200; // start loading 200px before bottom

        if (scrollPosition >= threshold) {
          setOrdersPage((prev) => prev + 1);
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, [ordersHasMore, ordersLoading]);

    useEffect(() => {
      if (ordersPage > 1 && id) {
        fetchOrders(ordersPage);
      }
    }, [ordersPage, id]);

  const handleToggleOrder = (orderId) => {
    const targetId = Number(orderId);

    setOrders((prev) =>
      prev.map((o) =>
        Number(o.order_id) === targetId
          ? { ...o, expanded: !o.expanded }
          : o
      )
    );

    if (!orderItems[targetId]) {
      fetchOrderItems(targetId);
    }
  };

  const handleOrderStatus = async (orderItem, status) => {
    try {
      const endpoint = `/api/order-item/${orderItem.order_item_id}`;
      const payload = { item_status: status };

      const { data } = await api.patch(endpoint, payload);

      alert(data.message);
      fetchInventory();
      fetchOrderItems(orderItem.order_id);
      fetchShop();

      await reloadOrders();
    } catch (err) {
        alert(orderItem.order_id);
    }
  };

    const reloadOrders = async () => {
      setOrders([]);
      setOrdersPage(1);
      setOrdersHasMore(true);
      await fetchOrders(1);
    };

    const handleEditInventory = async (inventoryId, updates) => {
      try {
        await api.patch(`/api/shop-inventory/${inventoryId}`, updates);
        await fetchInventory();
      } catch (err) {
        const msg =
          err.response?.data?.message || err.message || "Failed to update inventory";
        alert(msg);
      }
    };

    const handleDeleteInventory = async (inventoryId) => {
      if (!window.confirm("Are you sure you want to delete this inventory item?")) return;

      try {
        await api.delete(`/api/shop-inventory/${inventoryId}`);
        setInventory((prev) =>
          prev.filter((item) => item.shop_inventory_id !== inventoryId)
        );
      } catch (err) {
        const msg =
          err.response?.data?.message || err.message || "Failed to delete inventory";
        alert(msg);
      }
    };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await api.delete(`/api/order/${orderId}`);
      setOrders(prev => prev.filter(o => o.order_id !== orderId));
    } catch (err) {
        const msg =
          err.response?.data?.message || err.message || "Failed to delete order";
        alert(msg);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container2">
        <h2>{shop.shop_name}</h2>
        <p>
          <strong>Address:</strong> {shop.shop_address || "N/A"}
        </p>
        <p>
          <strong>Contact:</strong> {shop.shop_contact_number || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {shop.shop_email || "N/A"}
        </p>
        <p>
          <strong>UEN:</strong> {shop.shop_uen || "N/A"}
        </p>
        <hr />

        <div
          className="header-row"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignProducts: "center",
          }}
        >
          <h2>Inventory</h2>
        </div>

        <div className="shop-grid">
        {inventory.length > 0 ? (
            inventory.map((inventory) => <InventoryCard key={inventory.shop_inventory_id} inventory={inventory} onEdit={handleEditInventory} onDelete={handleDeleteInventory}/>)
        ) : (
            <p>No inventory records found.</p>
          )}
        </div>

        <hr />

        <div
          className="header-row"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>Orders</h2>
          <button
            onClick={() => setShowOrderModal(true)}
            className="add-btn"
          >
            + Order Product
          </button>
        </div>

        <div className="orders-section">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div
                key={order.order_id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  marginBottom: "10px",
                  overflow: "hidden",
                }}
              >
                <div
                  onClick={() => handleToggleOrder(order.order_id)}
                  style={{
                    background: "#f7f7f7",
                    padding: "12px 16px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong>Order #{order.order_id}</strong> — Total: ${order.total_price}
                    <br />
                    <small>
                      Created: {new Date(order.created_at).toLocaleString()}
                    </small>
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                    {order.expanded ? "−" : "+"}
                  </div>
                </div>

                {order.expanded && (
                  <div
                    className="shop-grid"
                    style={{ padding: "10px 16px", borderTop: "1px solid #ddd" }}
                  >
                    {orderItems[order.order_id] ? (
                      orderItems[order.order_id].length > 0 ? (
                        orderItems[order.order_id].map((orderItem) => (
                          <ShopOrderCard
                            key={orderItem.order_item_id}
                            order={orderItem}
                            onDelivered={() =>
                              handleOrderStatus(orderItem, "delivered")
                            }
                          />
                        ))
                      ) : (
                        <div style={{ display:"flex", alignItems:"center", width:"100%" }}>
                          <p>No order items found....</p>
                          <button
                            className="cancel-btn"
                            onClick={() => deleteOrder(order.order_id)}
                            style={{ padding:"4px 8px", fontSize:"12px" }}
                          >
                            Delete Order
                          </button>
                        </div>
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

          {ordersLoading && <p>Loading more orders...</p>}
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
