import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import Navbar from "../components/Navbar";
import api from "../api.js";
import EditSupplierProductModal from "../components/EditSupplierProductModal.jsx";
import ProductCard from "../components/ProductCard.jsx";
import SupplierOrderCard from "../components/SupplierOrderCard.jsx";
import AddSupplierProductModal from "../components/AddSupplierProductModal.jsx";

const SupplierPage = () => {
  const { id } = useParams();
  const [supplier, setSupplier] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditFormModal, setShowEditFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchSupplier = async () => {
    const { data } = await api.get(`/api/supplier/${id}`);
    setSupplier(data);
  };

  const fetchProducts = async () => {
    const { data } = await api.get(`/api/supplier-product/supplier/${id}`);
    setProducts(data);
  };

  const fetchOrders = async () => {
    const { data } = await api.get(`/api/order-item/supplier/${id}`);
    setOrders(data);
  };

  useEffect(() => {
    if (id) {
      fetchSupplier();
      fetchProducts();
      fetchOrders();
    }
  }, [id]);

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowEditFormModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditFormModal(false);
    fetchProducts();
  };

  const handleOrderStatus = async (order, status) => {
    try {
      const endpoint = `/api/order-item/${order.order_item_id}`;
      const payload = { item_status: status };

      const { data } = await api.patch(endpoint, payload);

      alert(data.message);
      fetchOrders();
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const handleDeleteProduct = async (product) => {
    await api.delete(`/api/supplier-product/${product.supplier_product_id}`);
    alert("Product deleted successfully.");
    fetchProducts();
  };

  return (
    <div className="supplier-page">
      <Navbar />
      <div className="container2">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Supplier: {supplier.supplier_name || "Unknown supplier"}</h1>
            <p className="subtitle">
              Manage this supplier&apos;s catalogue and incoming purchase orders.
            </p>
          </div>
          <div className="meta-badge">External Partner</div>
        </div>

        {/* Supplier details */}
        <div className="info-grid">
          <div className="info-item">
            <p className="label">UEN</p>
            <p className="value">{supplier.supplier_uen || "N/A"}</p>
          </div>
          <div className="info-item">
            <p className="label">Contact</p>
            <p className="value">
              {supplier.supplier_contact_number || "N/A"}
            </p>
          </div>
          <div className="info-item">
            <p className="label">Email</p>
            <p className="value">{supplier.supplier_email || "N/A"}</p>
          </div>
          <div className="info-item info-item-wide">
            <p className="label">Address</p>
            <p className="value">{supplier.supplier_address || "N/A"}</p>
          </div>
        </div>

        <hr />

        <div className="supplier-main">
          {/* Left: catalogue */}
          <div className="supplier-column">
            <div className="header-row">
              <h2>Catalogue</h2>
              <button
                onClick={() => setShowAddProductModal(true)}
                className="add-btn"
              >
                + Add Product
              </button>
            </div>

            {products && products.length > 0 ? (
              <div className="shop-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product.supplier_product_id}
                    product={product}
                    onEdit={() => handleEditProduct(product)}
                    onDelete={() => handleDeleteProduct(product)}
                  />
                ))}
              </div>
            ) : (
              <p>No products added for this supplier yet.</p>
            )}
          </div>

          {/* Right: incoming orders */}
          <div className="supplier-column">
            <h2>Incoming Orders</h2>

            {orders && orders.length > 0 ? (
              <div className="orders-list">
                {orders.map((order) => (
                  <SupplierOrderCard
                    key={order.order_item_id || order.order_id}
                    order={order}
                    onApprove={() => handleOrderStatus(order, "approved")}
                    onReject={() => handleOrderStatus(order, "rejected")}
                  />
                ))}
              </div>
            ) : (
              <p>No orders found.</p>
            )}
          </div>
        </div>
      </div>

        {showAddProductModal && (
        // adjust prop name if your modal expects something else
        <AddSupplierProductModal
            supplierId={id}
            onClose={() => setShowAddProductModal(false)}
            onSuccess={fetchProducts}
        />
        )}


      {showEditFormModal && editingProduct && (
        <EditSupplierProductModal
          product={editingProduct}
          onClose={() => setShowEditFormModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default SupplierPage;
