import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import Navbar from "../components/Navbar";
import api from "../api.js";
import ProductCard from "../components/ProductCard.jsx";
import SupplierOrderCard from "../components/SupplierOrderCard.jsx";
import AddSupplierProductModal from "../components/AddSupplierProductModal.jsx";

const SupplierPage = () => {
  const { id } = useParams();

  const [supplier, setSupplier] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [sortOption, setSortOption] = useState("created_at_desc");

  const fetchSupplier = async () => {
    const { data } = await api.get(`/api/supplier/${id}`);
    setSupplier(data);
  };

  const fetchProducts = async () => {
    const { data } = await api.get(`/api/supplier-product/supplier/${id}`);
    setProducts(data);
  };

  const fetchOrders = async () => {
    const last = sortOption.lastIndexOf("_");
    const field = sortOption.substring(0, last);
    const direction = sortOption.substring(last + 1);

    const { data } = await api.get(`/api/order-item/supplier/${id}`, {
      params: { sort: field, order: direction }
    });

    setOrders(data);
  };

  useEffect(() => {
    if (id) {
      fetchSupplier();
      fetchProducts();
      fetchOrders();
    }
  }, [id, sortOption]);

  const handleEditProduct = async (updates) => {
    if (updates.sku.length > 12) {
        alert("Check constraint 'chk_sku_length' is violated");
        return;
    }
    try {
      await api.patch(`/api/supplier-product/${updates.supplier_product_id}`, updates);
      await fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update product");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await api.delete(`/api/supplier-product/${productId}`);
      setProducts((prev) =>
        prev.filter((p) => p.supplier_product_id !== productId)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete product");
    }
  };

  const handleOrderStatus = async (order, status) => {
    try {
      const endpoint = `/api/order-item/${order.order_item_id}`;
      await api.patch(endpoint, { item_status: status });

      fetchOrders();
      fetchProducts(); // refresh stock if needed

    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container2">
        <h2>{supplier.supplier_name}</h2>
        <p><strong>Address:</strong> {supplier.supplier_address || "N/A"}</p>
        <p><strong>Contact:</strong> {supplier.supplier_contact_number || "N/A"}</p>
        <p><strong>Email:</strong> {supplier.supplier_email || "N/A"}</p>
        <p><strong>UEN:</strong> {supplier.supplier_uen || "N/A"}</p>
        <hr />

        {/* PRODUCTS */}
        <div className="header-row" style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>Products</h2>
          <button onClick={() => setShowAddProductModal(true)} className="add-btn">+ Add Product</button>
        </div>

        <div className="shop-grid">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard
                key={product.supplier_product_id}
                product={product}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>

        <hr />

        {/* ORDERS */}
        <div className="header-row" style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>Orders</h2>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            style={{ padding: "6px", borderRadius: "6px" }}
          >
            <option value="created_at_desc">Newest First</option>
            <option value="created_at_asc">Oldest First</option>
            <option value="shop_name_asc">Shop Name (A–Z)</option>
            <option value="shop_name_desc">Shop Name (Z–A)</option>
            <option value="product_name_asc">Product (A–Z)</option>
            <option value="product_name_desc">Product (Z–A)</option>
            <option value="item_status_asc">Status (A–Z)</option>
            <option value="item_status_desc">Status (Z–A)</option>
          </select>
        </div>

        <div className="shop-grid">
          {orders.length > 0 ? (
            orders.map((order) => (
              <SupplierOrderCard
                key={`${order.order_item_id}-${order.created_at}`}
                order={order}
                onAccept={() => handleOrderStatus(order, "approved")}
                onReject={() => handleOrderStatus(order, "rejected")}
              />
            ))
          ) : (
            <p>No orders found.</p>
          )}
        </div>
      </div>

      {/* ADD PRODUCT MODAL */}
      {showAddProductModal && (
        <AddSupplierProductModal
          supplierId={id}
          onClose={() => setShowAddProductModal(false)}
          onSuccess={fetchProducts}
        />
      )}
    </div>
  );
};

export default SupplierPage;
