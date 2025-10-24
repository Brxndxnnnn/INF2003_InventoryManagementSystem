import React, { useState } from "react";
import api from "../api";

const AddShopSupplierModal = ({ userId, role, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact_number: "",
    email: "",
    uen: "",
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
      const endpoint =
        role === "supplier" ? "/api/supplier" : "/api/shop";

      // Map field names to correct backend schema
      const payload =
        role === "supplier"
          ? {
              user_id: userId,
              supplier_name: formData.name,
              supplier_address: formData.address,
              supplier_contact_number: formData.contact_number,
              supplier_email: formData.email,
              supplier_uen: formData.uen,
            }
          : {
              user_id: userId,
              shop_name: formData.name,
              shop_address: formData.address,
              shop_contact_number: formData.contact_number,
              shop_email: formData.email,
              shop_uen: formData.uen,
            };

      // POST to API
      const { data } = await api.post(endpoint, payload);

      alert(`${role === "supplier" ? "Supplier" : "Shop"} created successfully!`);
      onSuccess(data);
    } catch (err) {
      alert(err.response?.data?.message || `Error creating ${role}.`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Create New {role === "supplier" ? "Supplier" : "Shop"}</h3>

        <form
          onSubmit={handleSubmit}
          style={{ border: "none", boxShadow: "none" }}
        >
          <input
            type="text"
            name="name"
            placeholder={`${role === "supplier" ? "Supplier" : "Shop"} Name`}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="address"
            placeholder={`${role === "supplier" ? "Supplier" : "Shop"} Address`}
            onChange={handleChange}
          />
          <input
            type="text"
            name="contact_number"
            placeholder="Contact Number (8 digits)"
            onChange={handleChange}
          />
          <input
            type="text"
            name="email"
            placeholder={`${role === "supplier" ? "Supplier" : "Shop"} Email`}
            onChange={handleChange}
          />
          <input
            type="text"
            name="uen"
            placeholder="UEN (e.g. 12345678X)"
            onChange={handleChange}
            required
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

export default AddShopSupplierModal;
