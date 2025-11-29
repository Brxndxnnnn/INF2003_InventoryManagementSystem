import React, { useState } from "react";

const InventoryCard = ({ inventory, onEdit, onDelete }) => {
  const id = inventory.shop_inventory_id;
  const product_name = inventory.product_name;
  const image = inventory.image;
  const description = inventory.description;
  const created = new Date(inventory.created_at).toLocaleString();
  const updated = new Date(inventory.updated_at).toLocaleString();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    reorder_level: inventory.reorder_level,
    current_stock: inventory.current_stock
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleSave = () => {
    if (onEdit) {
      onEdit(id, formData);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      reorder_level: inventory.reorder_level,
      current_stock: inventory.current_stock
    });
    setIsEditing(false);
  };

  return (
    <div className="shop-card">
      <div style={{ display: "flex", justifyContent: "center" }}>
        <img
          src={image}
          style={{ width: "50%", height: "50%", objectFit: "cover" }}
        />
      </div>

      <h3 className="shop-name">{product_name}</h3>
      <p>{description}</p>

      <p>
      </p>
      <p>
        <strong>Current Stock Quantity:</strong>{" "}
        {isEditing ? (
          <input
            type="number"
            name="current_stock"
            value={formData.current_stock}
            onChange={handleChange}
            style={{ width: "80px" }}
          />
        ) : (
          inventory.current_stock
        )}
      </p>
      <p>
        <strong>Reorder Level:</strong>{" "}
        {isEditing ? (
          <input
            type="number"
            name="reorder_level"
            value={formData.reorder_level}
            onChange={handleChange}
            style={{ width: "80px" }}
          />
        ) : (
          inventory.reorder_level
        )}
      </p>

      <p>
        <strong>Created At:</strong> {created}
      </p>
      <p>
        <strong>Last Updated:</strong> {updated}
      </p>

      <div className="card-actions">
        {isEditing ? (
          <>
            <button className="submit-btn" onClick={handleSave}>
              Save
            </button>
            <button className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="submit-btn" onClick={() => setIsEditing(true)}>
              Edit
            </button>
            <button
              className="cancel-btn"
              onClick={() => onDelete && onDelete(id)}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default InventoryCard;
