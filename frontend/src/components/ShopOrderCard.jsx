import React from "react";

const ShopOrderCard = ({ order, onDelivered}) => {
  const order_item_id = order.order_item_id;
  const product_name = order.product_name;
  const quantity_ordered = order.quantity_ordered;
  const unit_price = order.unit_price;
  const item_status = order.item_status;
  const delivery_notes = order.delivery_notes;
  const created = new Date(order.created_at).toLocaleString();

  return (
    <div className="shop-card">
      <h3 className="shop-name">Order Item #{order_item_id}</h3>
      <p><strong>Product Name:</strong> {product_name}</p>
      <p><strong>Quantity Ordered:</strong> {quantity_ordered} @ ${unit_price}</p>
      <p><strong>Delivery Notes:</strong> {delivery_notes}</p>
      <p><strong>Status:</strong> {item_status}</p>
      <p><strong>Created At:</strong> {created}</p>
      {item_status === "approved" && (
      <div className="card-actions">
        <button className="submit-btn" onClick={() => onDelivered(order)}>
          Mark as Delivered
        </button>
      </div>
      )}
    </div>
  );
};

export default ShopOrderCard;
