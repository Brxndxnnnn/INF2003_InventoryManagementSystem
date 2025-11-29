import React, { useEffect, useState } from "react";
import api from "../api.js";

const AddOrderModal = ({ shopId, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [supplierPage, setSupplierPage] = useState(1);
  const [supplierHasMore, setSupplierHasMore] = useState(true);
  const [products, setProducts] = useState([]);
  const [hideEmpty, setHideEmpty] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    quantity: "",
    delivery_notes: "",
  });

  const fetchSuppliers = async (query = "", hide = hideEmpty, pageNum = 1) => {
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append("q", query.trim());
      params.append("hideEmpty", hide ? "true" : "false");
      params.append("page", pageNum);
      params.append("limit", 10); // or any page size you like

      const { data } = await api.get(`/api/supplier/search?${params.toString()}`);
      const rows = Array.isArray(data) ? data : [];

      if (pageNum === 1) {
        setSuppliers(rows);
      } else {
        setSuppliers((prev) => [...prev, ...rows]);
      }

      // stop when fewer than limit
      if (rows.length < 10) setSupplierHasMore(false);
      else setSupplierHasMore(true);
    } catch (err) {
      console.error(err);
      setSuppliers([]);
    }
  };


  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (step === 1) {
        setSupplierPage(1);
        setSupplierHasMore(true);
        fetchSuppliers(searchTerm, hideEmpty, 1);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, hideEmpty, step]);


  const fetchProductsBySupplier = async (id) => {
    const { data } = await api.get(`/api/supplier-product/supplier/${id}`);
    setProducts(data);
  };

  // Form stuff
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const placeOrder = async () => {
    try {
      const payload = {
        shop_id: shopId,
        items: cart.map(item => ({
          supplier_product_id: item.supplier_product_id,
          quantity_ordered: item.quantity,
          unit_price: item.unit_price,
          delivery_notes: item.delivery_notes || null,
        }))
      };

      const { data } = await api.post("/api/order/full", payload);

      alert("Order placed");
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to place order";
      alert(errorMessage);
    }
  };

  useEffect(() => {
    const container = document.querySelector(".supplier-scroll-container");
    if (!container) return;

    const handleScroll = () => {
      if (!supplierHasMore) return;
      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 50
      ) {
        setSupplierPage((prev) => prev + 1);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [supplierHasMore]);

  useEffect(() => {
    if (step === 1 && supplierPage > 1) {
      fetchSuppliers(searchTerm, hideEmpty, supplierPage);
    }
  }, [supplierPage, step, searchTerm, hideEmpty]);



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
              <input
                type="checkbox"
                name="hide_supplier"
                style={{ width: "16px", cursor: "pointer", margin: "0px" }}
                checked={hideEmpty}
                onChange={(e) => setHideEmpty(e.target.checked)}
              />

            </div>
            </form>
              <div
                className="supplier-scroll-container"
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  marginBottom: "25px",
                  borderColor: "lightgrey",
                  borderWidth: "1px",
                  borderStyle: "solid",
                }}
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
                onClick={placeOrder}
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
