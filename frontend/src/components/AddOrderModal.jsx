import React, { useEffect, useState } from "react";
import api from "../api.js";

const AddOrderModal = ({ shopId, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    quantity: "",
    delivery_notes: "",
  });

  const fetchSuppliers = async (query = "") => {
  try {
      const endpoint = query.trim()
      ? `/api/supplier/search?q=${encodeURIComponent(query)}`: `/api/supplier/`;
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
    try{
        const orderId = await createOrder(); // Create order 
        for(const item of cart){ // Create individual order items
        await createOrderItem(orderId, item);
        }
        await updateOrderTotalPrice(orderId); // Update order price
        alert("Order placed");
        onClose();
    }
    catch (err){
        alert(err)
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
        alert(err)
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
        alert(err)
    }
  }

  const updateOrderTotalPrice = async (orderId) =>{
    try{
        const endpoint = `/api/order/${orderId}`
        await api.patch(endpoint);
    }
    catch (err){
        alert(err)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        {/* STEP 1: Select supplier */}
        {step === 1 && (
          <>
            <h3>1. Select Supplier to Order From</h3>
            <form style={{ border: "none", boxShadow: "none" }}>
            <input type="text" name="search_supplier"  placeholder="Search for suppliers" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            </form>
            <div
              style={{ maxHeight: "300px", overflowY: "auto", marginTop: "25px", marginBottom: "25px", borderColor:"lightgrey", borderWidth:"1px",   borderStyle: "solid",  }}
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
            <div className="product-list">
              {products.length > 0 ? (
                products.map((p) => (
                  <div
                    key={p.supplier_product_id || p.product_id}
                    className={`product-card ${
                      selectedProduct?.supplier_product_id === p.supplier_product_id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedProduct(p)}
                  >
                    <h4>{p.product_name}</h4>
                    <small>
                      Price: ${p.unit_price} | Stock: {p.stock_quantity}
                    </small>
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

            <div className="modal-actions">
            <button className="cancel-btn" onClick={() => { setCart([]); onClose(); }}>
                Cancel
            </button>
            <button className="cancel-btn" onClick={() => setStep(1)}>
                Add More Items
            </button>
            <button
                className="submit-btn"
                onClick={() => {placeOrder(cart)}}
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
