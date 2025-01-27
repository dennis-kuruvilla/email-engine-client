import React, { useState } from "react";
import "../App.css";

const AuthPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const user = { username, password };
    const baseUrl = "http://localhost:3000/api";

    try {
      let response;

      if (isSignUp) {
        response = await fetch(`${baseUrl}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        });

        if (response.status === 201) {
          setMessage("Account created, please log in.");
        } else {
          throw new Error("Sign-up failed");
        }
      } else {
        response = await fetch(`${baseUrl}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        });

        if (response.status === 201) {
          const data = await response.json();
          localStorage.setItem("accessToken", data.accessToken);
          window.location.href = "/email-data";
        } else {
          throw new Error("Invalid username or password");
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <h2>{isSignUp ? "Sign Up" : "Log In"}</h2>

      {message && <div className="message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isSignUp ? "Sign Up" : "Log In"}</button>
      </form>
      <button onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp
          ? "Already have an account? Log in"
          : "Need an account? Sign up"}
      </button>
    </div>
  );
};

export default AuthPage;
