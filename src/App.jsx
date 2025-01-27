import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import AuthPage from "./components/AuthPage";
import EmailDataPage from "./components/EmailDataPage";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("accessToken") !== null
  );

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/email-data" />
            ) : (
              <AuthPage setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />

        <Route
          path="/email-data"
          element={isAuthenticated ? <EmailDataPage /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
