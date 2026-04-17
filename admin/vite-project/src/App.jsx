import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/sidebar/Sidebar";
import { Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Orders from "./pages/Order/Orders";
import Audits from "./pages/Audits/Audits";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { url } from "./assets/assets";
import Login from "./pages/Login/Login";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const { pathname } = useLocation();

  // Redirect or handle initial state if needed
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  return (
    <div className="admin-app">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {token === "" ? (
        <Login url={url} setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <div className="app-content">
            <Sidebar />
            <div className="page-content">
              <Routes>
                <Route path="/dashboard" element={<Dashboard url={url} />} />
                <Route path="/add" element={<Add url={url} />} />
                <Route path="/list" element={<List url={url} />} />
                <Route path="/orders" element={<Orders url={url} />} />
                <Route path="/audits" element={<Audits url={url} />} />
                {/* Default route to dashboard */}
                <Route path="/" element={<Dashboard url={url} />} />
                <Route path="*" element={<Dashboard url={url} />} />
              </Routes>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
