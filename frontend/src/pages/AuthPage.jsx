import React, { useState } from "react";
import { useNavigate } from "react-router";
import AuthForm from "../components/AuthForm.jsx";
import api from "../api.js";

const AuthPage = () => {
  const [mode, setMode] = useState("login"); // toggle between login/register
  const navigate = useNavigate();

  const handleSubmit = async ({ email, password, userType }) => {
    try {
      // Decide endpoint based on mode
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";

      // Build payload
      const payload =
        mode === "login"
          ? { email, password }
          : { email, password, user_type: userType };

      const { data } = await api.post(endpoint, payload);

      // Login success
      if (mode === "login") {
        const userData = {
          user_id: data.user.user_id,
          email: data.user.email,
          user_type: data.user.user_type,
          isLoggedIn: true,
        };
        sessionStorage.setItem("user", JSON.stringify(userData));
        navigate("/home");
      }
      // Registration success
      else {
        alert("Account created successfully!");
        setMode("login");
      }
    } catch (err) {
      alert(err.response.data.message);
    }
  };

    // Page layout
    return (
        <div className={`center-screen ${mode === "login" ? "login-page" : "register-page"}`} style={{ flexDirection: "column" }}>
            <div style={{ marginBottom: "2rem", textAlign: "center" }}>
                <h1>Unified Supplier Ordering and Inventory Management Platform</h1>
            </div>

            <div className="auth-card">
            <AuthForm mode={mode} onSubmit={handleSubmit} />
            <p style={{ marginTop: "1rem" }}>
                {mode === "login" ? (
                <>
                    Don’t have an account?{" "}
                    <span className="link-text" onClick={() => setMode("register")}>
                    Register
                    </span>
                </>
                ) : (
                <>
                    Already have an account?{" "}
                    <span className="link-text" onClick={() => setMode("login")}>
                    Login
                    </span>
                </>
                )}
            </p>
            </div>
        </div>
    );
};

export default AuthPage;
