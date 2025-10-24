import React, { useState } from "react";
import api from "../api";

const AddSupplierProductModalForm = ({ supplierId, product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    sku: "",
    unit_price: 0,
    min_order_quantity: 0,
    stock_quantity: 0,
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Pick endpoint based on role
      const endpoint = "/api/supplier-product"

      // Map field names to correct backend schema
      const payload =
      {
        product_id: product.product_id,
        supplier_id: supplierId,
        sku: formData.sku,
        unit_price: formData.unit_price,
        min_order_quantity: formData.min_order_quantity,
        stock_quantity: formData.stock_quantity,
        is_available: 1
      }

      // POST to API
      const { data } = await api.post(endpoint, payload);

      alert(`Product added successfully!`);
      onSuccess(data);
    } catch (err) {
      alert(err.response?.data?.message, supplierId);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>2. Create New Product</h3>

        <form
          onSubmit={handleSubmit}
          style={{ border: "none", boxShadow: "none" }}
        >
          <input
            type="text"
            name="sku"
            placeholder={"SKU"}
            onChange={handleChange}
          />
          <input
            type="number"
            name="unit_price"
            step="0.01"
            placeholder={"Unit Price ($00.00)"}
            onChange={handleChange}
          />
          <input
            type="number"
            name="min_order_quantity"
            placeholder={"Minimum Order Quantity"}
            onChange={handleChange}
          />
          <input
            type="number"
            name="stock_quantity"
            placeholder={"Stock Quantity"}
            onChange={handleChange}
          />

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

export default AddSupplierProductModalForm;
