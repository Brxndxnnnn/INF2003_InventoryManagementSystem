import React, { useEffect, useState } from "react";
import api from "../api.js";

const AddOrderModal = ({ shopId, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [hideEmpty, setHideEmpty] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    quantity: "",
    delivery_notes: "",
  });

  const fetchSuppliers = async (query = "", hide = hideEmpty) => {
    try {
      const endpoint = query.trim()
        ? `/api/supplier/search?q=${encodeURIComponent(query)}&hideEmpty=${hide}`
        : `/api/supplier/search?hideEmpty=${hide}`;
      const { data } = await api.get(endpoint);
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setSuppliers([]);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
        fetchSuppliers(searchTerm);
    }, 400); // debounce to prevent spam call api when i spam type words, wait 400ms then calls the api

    return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

  const fetchProductsBySupplier = async (id) => {
    const { data } = await api.get(`/api/supplier-product/supplier/${id}`);
    setProducts(data);
  };

  // Form stuff
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  // Create Order
  const placeOrder = async (cart) => {
    let orderId = null;
    try{
        orderId = await createOrder(); // Create order 
        for(const item of cart){ // Create individual order items
        await createOrderItem(orderId, item);
        }
        await updateOrderTotalPrice(orderId); // Update order price
        alert("Order placed");
        onSuccess();
        onClose();
    }
    catch (err){
        // If order was created but items failed, delete the order
        if (orderId) {
          try {
            await api.delete(`/api/order/${orderId}`);
          } catch (deleteErr) {
            console.error("Error cleaning up order:", deleteErr);
          }
        }
        
        // Display proper error message
        const errorMessage = err.response?.data?.message || err.message || "Failed to place order";
        alert(errorMessage);
    }
  };

  const createOrder = async () =>{
    try{
        const endpoint = "/api/order"
        const payload = {shop_id: shopId}
        const { data } = await api.post(endpoint, payload);
        return data.order_id
    }
    catch (err){
        const errorMessage = err.response?.data?.message || err.message || "Failed to create order";
        throw new Error(errorMessage);
    }
  }

  const createOrderItem = async (orderId, cartItem) =>{
    try{
        const endpoint = "/api/order-item"
        const payload =
        {
            order_id: orderId,
            supplier_product_id: cartItem.supplier_product_id,
            quantity_ordered: cartItem.quantity,
            unit_price: cartItem.unit_price,
            delivery_notes: cartItem.delivery_notes || null,
        }
        console.log(payload)
        await api.post(endpoint, payload);
    }
    catch (err){
        const errorMessage = err.response?.data?.message || err.message || "Failed to create order item";
        throw new Error(errorMessage);
    }
  }

  const updateOrderTotalPrice = async (orderId) =>{
    try{
        const endpoint = `/api/order/${orderId}`
        await api.patch(endpoint);
    }
    catch (err){
        const errorMessage = err.response?.data?.message || err.message || "Failed to update order total";
        throw new Error(errorMessage);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        {/* STEP 1: Select supplier */}
        {step === 1 && (
          <>
            <h3>1. Select Supplier to Order From</h3>
            <form style={{ border: "none", boxShadow: "none", padding: "20px 0px" }}>
            <input type="text" name="search_supplier"  placeholder="Search for suppliers" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <label htmlFor="hide_supplier" style={{ whiteSpace: "nowrap" }}> Hide suppliers with no available products: </label>
              <input type="checkbox" name="hide_supplier" style={{ width:"16px", cursor: "pointer", margin:"0px" }} checked={hideEmpty} onChange={(e) => {setHideEmpty(e.target.checked); fetchSuppliers(searchTerm, e.target.checked)}}></input>
            </div>
            </form>
            <div
              style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "25px", borderColor:"lightgrey", borderWidth:"1px",   borderStyle: "solid",  }}
            >
              {suppliers.map((s) => (
                <div
                  key={s.supplier_id}
                  className={`product-card ${
                    selectedSupplier?.supplier_id === s.supplier_id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedSupplier(s)}
                >
                  <h4>{s.supplier_name}</h4>
                  <h6>{s.supplier_contact_number || "N/A"}</h6>
                  <h6>{s.supplier_email || "N/A"}</h6>
                  <h6>{s.supplier_uen}</h6>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button
                className="submit-btn"
                onClick={() => {
                  if (selectedSupplier) {
                    setStep(2);
                    fetchProductsBySupplier(selectedSupplier.supplier_id);
                  }
                }}
                disabled={!selectedSupplier}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* STEP 2: Select product from that supplier */}
        {step === 2 && selectedSupplier && (
          <>
            <h3>2. Select Product from {selectedSupplier.supplier_name}</h3>
            <div style={{ maxHeight: "300px", overflowY: "auto", margin: "20px 0", border: "1px solid lightgray"}}>
              {products.length > 0 ? (
                products.map((p) => (
                  <div 
                  key={p.supplier_product_id || p.product_id} 
                  className={`product-card ${selectedProduct?.supplier_product_id === p.supplier_product_id ? "selected" : ""}`}
                  onClick={() => setSelectedProduct(p)}
                  style={{ display: "flex", padding: "10px", alignItems: "center", border: selectedProduct?.supplier_product_id === p.supplier_product_id ? "2px solid #007bff" : "1px solid #ccc", marginBottom: "10px", borderRadius: "6px", cursor: "pointer" }}>
                    <div style={{width: "80px", height:"80px", marginRight: "10px",flexShrink: 0,overflow: "hidden"}}>
                    <img src={p.image} style={{width: "100%", height: "100%",objectFit: "cover",}}/>
                    </div>
                    <div>
                      <h4>{p.product_name}</h4>
                      <small>
                        Price: ${p.unit_price} | Stock: {p.stock_quantity}
                      </small>
                    </div>
                  </div>
                ))
              ) : (
                <p>No products available.</p>
              )}
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                className="submit-btn"
                onClick={() => selectedProduct && setStep(3)}
                disabled={!selectedProduct}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* STEP 3: Fill in order form */}
        {step === 3 && selectedProduct && (
        <>
            <h3>3. Add Order Details for {selectedProduct.product_name}</h3>
            <form
            onSubmit={(e) => {
                e.preventDefault();
                if (!selectedProduct || !selectedSupplier) return;

                const orderItem = {
                supplier_product_id: selectedProduct.supplier_product_id,
                product_name: selectedProduct.product_name,
                supplier_name: selectedSupplier.supplier_name,
                quantity: Number(formData.quantity),
                delivery_notes: formData.delivery_notes,
                unit_price: selectedProduct.unit_price
                };

                setCart((prev) => [...prev, orderItem]);
                setSelectedProduct(null);
                setFormData({ quantity: "", delivery_notes: "" });
                setStep(4); // go to review cart
            }}
            style={{ border: "none", boxShadow: "none" }}
            >
            <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={handleFormChange}
                required
            />
            <input
                type="text"
                name="delivery_notes"
                placeholder="Delivery notes (optional)"
                value={formData.delivery_notes}
                onChange={handleFormChange}
            />

            <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setStep(2)}>
                Back
                </button>
                <button type="submit" className="submit-btn">
                Add to Cart
                </button>
            </div>
            </form>
        </>
        )}


        {/* STEP 4: Review Cart */}
        {step === 4 && (
        <>
            <h3>4. Review Your Order</h3>
            <div style={{ padding:"20px"}}>
            {cart.length > 0 ? (
            <ul style={{ marginBottom: "1rem" }}>
                {cart.map((item, idx) => (
                <li key={idx}>
                    <b>{item.product_name}</b> from {item.supplier_name}<br />
                    Quantity: {item.quantity} x ${item.unit_price} = ${(item.quantity * item.unit_price)}<br />
                    Delivery Notes: {item.delivery_notes}
                    <hr></hr>
                </li>
                ))}
            </ul>
            ) : (
            <p>Your order is empty.</p>
            )}        
            </div>
            <div className="modal-actions">
            <button className="cancel-btn" onClick={() => { setCart([]); onClose(); }}>
                Cancel
            </button>
            <button className="cancel-btn" onClick={() => setStep(1)}>
                Add More Items
            </button>
            <button
                className="submit-btn"
                onClick={() => {placeOrder(cart);}}
                disabled={cart.length === 0}
            >
                Submit Order
            </button>
            </div>
        </>
        )}



      </div>
    </div>
  );
};

export default AddOrderModal;
