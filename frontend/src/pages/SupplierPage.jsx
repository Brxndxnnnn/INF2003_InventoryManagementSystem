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
        setOrders(data)
    }

    useEffect(() => {if (id) fetchSupplier(); fetchProducts(); fetchOrders();}, [id]);

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
        const { data } = await api.delete(`/api/supplier-product/${product.supplier_product_id}`);
        alert("Product deleted successfully.");
        fetchProducts();
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
            <hr></hr>
            <div className="header-row" style={{ display: "flex", justifyContent: "space-between", alignProducts: "center" }}>
                <h2>Products</h2>
                <button  onClick={() => setShowAddProductModal(true)} className="add-btn">
                    + Add Product
                </button>
            </div>
            <div className="shop-grid">
            {products.length > 0 ? (
                products.map((product) => <ProductCard key={product.supplier_product_id} product={product} onEdit={() => handleEditProduct(product)} onDelete={() => handleDeleteProduct(product)} />)
            ) : (
                <p>No products found.</p>
            )}
            </div>
            <hr></hr>
            <div className="header-row" style={{ display: "flex", justifyContent: "space-between", alignProducts: "center" }}>
                <h2>Orders</h2>
            </div>
            <div className="shop-grid">
            {orders.length > 0 ? (
                orders.map((order) => <SupplierOrderCard key={order.order_item_id} order={order} onAccept={() => handleOrderStatus(order, "approved")} onReject={() => handleOrderStatus(order, "rejected")}/>)
            ) : (
                <p>No orders found.</p>
            )}
            </div>
        </div>
        {showAddProductModal && (<AddSupplierProductModal supplierId={id} onClose={() => setShowAddProductModal(false)} onSuccess = {fetchProducts}/>)}
        {showEditFormModal && editingProduct && (<EditSupplierProductModal product={editingProduct} onClose={() => setShowEditFormModal(false)} onSuccess={handleEditSuccess}/>)}
    </div>
  )
}

export default SupplierPage