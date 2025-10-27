import React, { useEffect, useState } from "react";
import api from "../api.js";

const AddSupplierProductModal = ({ onClose, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [formData, setFormData] = useState({
    category_id: "",
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if(value === ""){
      fetchAllProducts();
    }
    else{
      fetchProductsByCategory(value);
    }
  };

  const fetchCategories = async () => {
      const { data } = await api.get(`/api/category/`);
      setCategories(data);
  }

  const fetchAllProducts = async () => {
      const { data } = await api.get(`/api/product`);
      setProducts(data);
  }

  const fetchProductsByCategory = async (categoryId) => {
      const { data } = await api.get(`/api/product/category/${categoryId}`);
      setProducts(data);
  }

  useEffect(() => {fetchCategories(); fetchAllProducts();}, []);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    onSuccess(selectedProduct);
    onClose();          
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div>
          
        </div>
        <h3>1. Choose product to add</h3>
        <form onSubmit={handleSubmit} style={{ border: "none", boxShadow: "none" }}>
          <select
            name="category_id"
            value={formData.category_id || ""}
            onChange={handleChange}>
              
            <option value="">Choose a category</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
            ))}
          </select> 

          <div className="product-list">
            {products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product.product_id}
                  className={`product-card ${
                    selectedProduct?.product_id === product.product_id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <h4>{product.product_name}</h4>
                  <p>{product.description || "No description"}</p>
                  <small>Unit: {product.unit_of_measure}</small>
                </div>
              ))
            ) : (
              <p>No products found.</p>
            )}
          </div>

          <div className="modal-actions">
            <button type="submit" className="submit-btn" disabled={!selectedProduct}>
              Next
            </button>
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSupplierProductModal;
