import React, { useState } from "react";
import api from "../api";

const EditSupplierProductModal = ({ product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    sku: product.sku || "",
    unit_price: product.unit_price || 0,
    min_order_quantity: product.min_order_quantity || 0,
    stock_quantity: product.stock_quantity || 0,
    is_available: product.is_available ?? 1,
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "is_available"
          ? Number(value)  // Convert to integer 1 or 0 for MySQL TINYINT
          : value,
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Pick endpoint based on role
      const endpoint = "/api/supplier-product/" + product.supplier_product_id;

      // Map field names to correct backend schema
      const payload =
      {
        sku: formData.sku,
        unit_price: formData.unit_price,
        min_order_quantity: formData.min_order_quantity,
        stock_quantity: formData.stock_quantity,
        is_available: formData.is_available
      }

      // PATCH to API
      const { data } = await api.patch(endpoint, payload);
      alert("Product edited successfully.");
      onSuccess(data);
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Edit Product Information</h3>

        <form
          onSubmit={handleSubmit}
          style={{ border: "none", boxShadow: "none" }}
        >
          <input
            type="text"
            name="category_name"
            value={product.category_name}
            disabled
          />
          <input
            type="text"
            name="product_name"
            value={product.product_name}
            disabled
          />
          <input
            type="text"
            name="sku"
            value={formData.sku}
            placeholder={"SKU"}
            onChange={handleChange}
          />
          <input
            type="number"
            name="unit_price"
            value={formData.unit_price}
            step="0.01"
            placeholder={"Unit Price ($00.00)"}
            onChange={handleChange}
          />
          <input
            type="number"
            name="min_order_quantity"
            value={formData.min_order_quantity}
            placeholder={"Minimum Order Quantity"}
            onChange={handleChange}
          />
          <input
            type="number"
            name="stock_quantity"
            value={formData.stock_quantity}
            placeholder={"Stock Quantity"}
            onChange={handleChange}
          />
          <select
            id="availability-select"
            name="is_available"
            value={formData.is_available}
            onChange={handleChange}>
              
            <option value="1">Available</option>
            <option value="0">Unavailable</option>
          </select> 
          <div className="modal-actions">
            <button type="submit" className="submit-btn">
              Create
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

export default EditSupplierProductModal;
