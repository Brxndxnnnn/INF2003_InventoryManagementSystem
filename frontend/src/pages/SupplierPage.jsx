import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import Navbar from "../components/Navbar";
import api from "../api";
import AddSupplierProductModalCategory from "../components/AddSupplierProductModalCategory.jsx";
import AddSupplierProductModalForm from "../components/AddSupplierProductModalForm.jsx";
import EditSupplierProductModal from "../components/EditSupplierProductModal.jsx";
import ProductCard from "../components/ProductCard.jsx";

const SupplierPage = () => {
    const { id } = useParams();
    const user = JSON.parse(sessionStorage.getItem("user"));
    const [supplier, setSupplier] = useState([]);
    const [products, setProducts] = useState([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showEditFormModal, setShowEditFormModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);

    const fetchSupplier = async () => {
        const { data } = await api.get(`/api/supplier/${id}`);
        setSupplier(data);
    };

    const fetchProducts = async () => {
        const { data } = await api.get(`/api/supplier-product/supplier/${id}`);
        setProducts(data);
    };

    useEffect(() => {if (id) fetchSupplier(); fetchProducts();}, [id]);

    const handleProductChosen = (product) => {
        setSelectedProduct(product);
        setShowCategoryModal(false);
        setShowFormModal(true);
    };

    const handleProductAdded = (data) => {
        setShowFormModal(false);
        fetchProducts();
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setShowEditFormModal(true);
    };

    const handleEditSuccess = () => {
        setShowEditFormModal(false);
        fetchProducts();
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
                <button  onClick={() => setShowCategoryModal(true)} className="add-btn">
                    + Add Product
                </button>
            </div>
            <div className="shop-grid">
            {products.length > 0 ? (
                products.map((product) => <ProductCard key={product.product_id} product={product} onEdit={() => handleEditProduct(product)} onDelete={() => handleDeleteProduct(product)} />)
            ) : (
                <p>No products found.</p>
            )}
            </div>
        </div>
        {showCategoryModal && (<AddSupplierProductModalCategory onClose={() => setShowCategoryModal(false)} onSuccess={handleProductChosen}/>)}
        {showFormModal && selectedProduct && (<AddSupplierProductModalForm supplierId={id} product={selectedProduct} onClose={() => setShowFormModal(false)} onSuccess={handleProductAdded}/>)}
        {showEditFormModal && editingProduct && (<EditSupplierProductModal product={editingProduct} onClose={() => setShowEditFormModal(false)} onSuccess={handleEditSuccess}/>)}
    </div>
  )
}

export default SupplierPage