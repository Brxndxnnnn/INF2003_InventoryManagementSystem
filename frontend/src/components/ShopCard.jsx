import React from "react";

const ShopCard = ({ shop, role }) => {
  const id = shop.shop_id || shop.supplier_id;
  const name = shop.shop_name || shop.supplier_name;
  const address = shop.shop_address || shop.supplier_address;
  const contact = shop.shop_contact_number || shop.supplier_contact_number;
  const email = shop.shop_email || shop.supplier_email;
  const uen = shop.shop_uen || shop.supplier_uen;
{role === "supplier" ? "/supplier/" : "/shop/"}
  return (
    <div className="shop-card">
      <h3 className="shop-name"><a href={`${role === "supplier" ? "/supplier/" : "/shop/"}${id}`}>{name}</a></h3>
      <p><strong>Address:</strong> {address || "N/A"}</p>
      <p><strong>Contact:</strong> {contact || "N/A"}</p>
      <p><strong>Email:</strong> {email || "N/A"}</p>
      <p><strong>UEN:</strong> {uen || "N/A"}</p>
      
    </div>
  );
};

export default ShopCard;
