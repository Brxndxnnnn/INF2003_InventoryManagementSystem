import React from "react";

const ProductCard = ({ product, onEdit, onDelete }) => {
  const id = product.supplier_product_id;
  const sku = product.sku || "N/A";
  const name = product.product_name || "Unnamed Product";
  const category = product.category_name || "Uncategorized";
  const unit = product.unit_of_measure || "N/A";
  const unitPrice = product.unit_price ?? "N/A";
  const minOrder = product.min_order_quantity ?? "N/A";
  const stock = product.stock_quantity ?? "N/A";
  const isAvailable = product.is_available ? "Available" : "Unavailable";
  const created = new Date(product.created_at).toLocaleString();
  const updated = new Date(product.updated_at).toLocaleString();

  return (
    <div className="shop-card">
      <h3 className="shop-name">{name}</h3>
      <p><strong>Category:</strong> {category}</p>
      <p><strong>SKU:</strong> {sku}</p>
      <p><strong>Unit of Measure:</strong> {unit}</p>
      <p><strong>Unit Price:</strong> ${unitPrice}</p>
      <p><strong>Min Order Quantity:</strong> {minOrder}</p>
      <p><strong>Stock Quantity:</strong> {stock}</p>
      <p><strong>Status:</strong> {isAvailable}</p>
      <p><strong>Created At:</strong> {created}</p>
      <p><strong>Last Updated:</strong> {updated}</p>

      <div className="card-actions">
        <button className="submit-btn" onClick={() => onEdit(product)}>
          Edit
        </button>
        <button className="cancel-btn" onClick={() => onDelete(id)}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
