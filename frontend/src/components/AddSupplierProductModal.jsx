import React, { useEffect, useState } from "react";
import api from "../api.js";

const AddSupplierProductModal = ({ supplierId, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [formData, setFormData] = useState({
    sku: "",
    unit_price: "",
    min_order_quantity: "",
    stock_quantity: "",
  });

  // Fetch categories and products
  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/api/category/");
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

const fetchProducts = async (pageNum = 1) => {
  try {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append("q", searchTerm.trim());
    if (selectedCategory) params.append("categoryId", selectedCategory);
    params.append("page", pageNum);

    const { data } = await api.get(`/api/product/search?${params.toString()}`);

    if (pageNum === 1) setProducts(data.data);
    else setProducts((prev) => [...prev, ...data.data]);

    // Stop loading if fewer results than limit
    if (data.data.length < 10) setHasMore(false);
    else setHasMore(true);
  } catch (err) {
    console.error("Error fetching products:", err);
    setProducts([]);
  }
};



  // Handle debounce + reset on filters
  useEffect(() => {
    const delay = setTimeout(() => {
      if (step === 1) {
        setPage(1);
        fetchProducts(1, true); // reset to first page
        fetchCategories();
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm, selectedCategory, step]);

  // Infinite scroll event listener
  useEffect(() => {
    const container = document.querySelector(".product-scroll-container");
    if (!container) return;

    const handleScroll = () => {
      if (!hasMore) return;
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
        setPage((prev) => prev + 1);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMore]);

  // Fetch more pages when page increases
  useEffect(() => {
    if (step === 1 && page > 1) fetchProducts(page);
  }, [page, step]);




  // Category filter change
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    if (value) fetchProducts(value);
    else fetchProducts();
  };

  // Input change
  const handleFormChange = (e) => {
    console.log(selectedProduct);
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Create supplier product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (formData.sku.length > 12) {
        alert("Check constraint 'chk_sku_length' is violated");
        return;
    }
    try {
      const payload = {
        product_id: selectedProduct.product_id,
        supplier_id: supplierId,
        sku: formData.sku,
        unit_price: parseFloat(formData.unit_price),
        min_order_quantity: parseInt(formData.min_order_quantity),
        stock_quantity: parseInt(formData.stock_quantity),
        is_available: 1,
      };

      await api.post("/api/supplier-product", payload);
      alert("Product added successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        {/* STEP 1: Choose Product */}
        {step === 1 && (
          <>
            <h3>1. Choose Product to Add</h3>
            <div style={{display: "flex", alignItems: "center", gap: "10px", margin: "20px 0"}}>
                  <input
                    type="text"
                    placeholder="Search products"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ height: "40px", margin:"0px"}}
                />
                <select name="category_id" value={selectedCategory} onChange={handleCategoryChange}>
                <option value="">All Categories</option>
                {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                    </option>
                ))}
                </select>
            </div>
            <div className="product-scroll-container" style={{ maxHeight: "300px", overflowY: "auto", margin: "20px 0", border: "1px solid lightgray" }}>
              {products.length > 0 ? (
                products.map((p) => (
                  <div
                    key={p.product_id}
                    className={`product-card ${selectedProduct?.product_id === p.product_id ? "selected" : ""}`}
                    onClick={() => setSelectedProduct(p)}
                    style={{ display: "flex", padding: "10px", alignItems: "center", border: selectedProduct?.product_id === p.product_id ? "2px solid #007bff" : "1px solid #ccc", marginBottom: "10px", borderRadius: "6px", cursor: "pointer" }}
                  >
                    <div style={{ width: "80px", height: "80px", marginRight: "10px", flexShrink: 0, overflow: "hidden" }}>
                      <img src={p.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                      <h4>{p.product_name}</h4>
                    </div>
                  </div>
                ))
              ) : (
                <p>No products available.</p>
              )}
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="submit-btn"
                disabled={!selectedProduct}
                onClick={() => {
                  if (selectedProduct) {
                    setStep(2);
                  }
                }}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* STEP 2: Fill in Details */}
        {step === 2 && selectedProduct && (
          <>
            <h3>2. Enter Product Details for {selectedProduct.product_name}</h3>
            <form
              onSubmit={handleCreateProduct}
              style={{ border: "none", boxShadow: "none" }}
            >
              <input
                type="text"
                name="sku"
                placeholder="SKU"
                onChange={handleFormChange}
                required
              />
              <input
                type="number"
                name="unit_price"
                step="0.01"
                placeholder="Unit Price ($00.00)"
                onChange={handleFormChange}
                required
              />
              <input
                type="number"
                name="min_order_quantity"
                placeholder="Minimum Order Quantity"
                onChange={handleFormChange}
                required
              />
              <input
                type="number"
                name="stock_quantity"
                placeholder="Stock Quantity"
                onChange={handleFormChange}
                required
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {setStep(1); fetchProducts()}}
                >
                  Back
                </button>
                <button type="submit" className="submit-btn">
                  Create
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AddSupplierProductModal;
