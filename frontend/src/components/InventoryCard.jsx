import React from "react";

const InventoryCard = ({ inventory, onEdit, onDelete }) => {
  const id = inventory.shop_inventory_id;
  const product_name = inventory.product_name;
  const image = inventory.image
  const description = inventory.description;
  const current_stock = inventory.current_stock;
  const reorder_level = inventory.reorder_level;
  const max_stock_level = inventory.max_stock_level;
  const created = new Date(inventory.created_at).toLocaleString();
  const updated = new Date(inventory.updated_at).toLocaleString();
  

  return (
    <div className="shop-card">
      <div style={{ display: "flex", justifyContent: "center" }}>
        <img src={image} style={{ width: "50%", height: "50%", objectFit: "cover" }} />
      </div>
      <h3 className="shop-name">{product_name}</h3>
      <p>{description}</p>
      <p><strong>Current Stock Quantity:</strong> {current_stock}</p>
      <p><strong>Reorder Level:</strong> {reorder_level}</p>
      <p><strong>Max Stock:</strong> {max_stock_level}</p>

      <p><strong>Created At:</strong> {created}</p>
      <p><strong>Last Updated:</strong> {updated}</p>

      <div className="card-actions">
        {/* <button className="submit-btn" onClick={() => onEdit(inventory)}>
          Edit
        </button>
        <button className="cancel-btn" onClick={() => onDelete(id)}>
          Delete
        </button> */}
      </div>
    </div>
  );
};

export default InventoryCard;
