import React, { useState } from "react";

const AuthForm = ({ mode, onSubmit }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("shop");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password, userType });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{mode === "login" ? "Login" : "Register"}</h2>

      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {mode === "register" && 
      (
        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          required
        >
          <option value="shop">Shop</option>
          <option value="supplier">Supplier</option>
        </select>
      )}

      <button type="submit">
        {mode === "login" ? "Login" : "Create Account"}
      </button>
    </form>
  );
};

export default AuthForm;
