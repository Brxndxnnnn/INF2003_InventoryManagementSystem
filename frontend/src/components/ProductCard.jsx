import React, { useState } from "react";

const ProductCard = ({ product, onEdit, onDelete }) => {
  const id = product.supplier_product_id;

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    sku: product.sku,
    unit_price: product.unit_price,
    min_order_quantity: product.min_order_quantity
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "sku" ? value : Number(value)
    }));
  };

  const handleSave = () => {
    if (onEdit) {
      onEdit({
        supplier_product_id: id,
        ...formData
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      sku: product.sku,
      unit_price: product.unit_price,
      min_order_quantity: product.min_order_quantity
    });
    setIsEditing(false);
  };

  const created = new Date(product.created_at).toLocaleString();
  const updated = new Date(product.updated_at).toLocaleString();

  return (
    <div className="shop-card">
      <div style={{ display: "flex", justifyContent: "center" }}>
        <img
          src={product.image}
          style={{ width: "50%", height: "50%", objectFit: "cover" }}
        />
      </div>

      <h3 className="shop-name">{product.product_name}</h3>

      <p><strong>Category:</strong> {product.category_name}</p>

      <p>
        <strong>SKU:</strong>{" "}
        {isEditing ? (
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            style={{ width: "120px" }}
          />
        ) : (
          product.sku
        )}
      </p>

      <p>
        <strong>Unit Price:</strong>{" "}
        {isEditing ? (
          <input
            type="number"
            name="unit_price"
            value={formData.unit_price}
            onChange={handleChange}
            style={{ width: "80px" }}
          />
        ) : (
          `$${product.unit_price}`
        )}
      </p>

      <p>
        <strong>Min Order Quantity:</strong>{" "}
        {isEditing ? (
          <input
            type="number"
            name="min_order_quantity"
            value={formData.min_order_quantity}
            onChange={handleChange}
            style={{ width: "80px" }}
          />
        ) : (
          product.min_order_quantity
        )}
      </p>

      <p><strong>Stock Quantity:</strong> {product.stock_quantity}</p>
      <p><strong>Status:</strong> {product.is_available ? "Available" : "Unavailable"}</p>

      <p><strong>Created At:</strong> {created}</p>
      <p><strong>Last Updated:</strong> {updated}</p>

      <div className="card-actions">
        {isEditing ? (
          <>
            <button className="submit-btn" onClick={handleSave}>Save</button>
            <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
          </>
        ) : (
          <>
            <button className="submit-btn" onClick={() => setIsEditing(true)}>Edit</button>
            <button className="cancel-btn" onClick={() => onDelete(id)}>Delete</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
