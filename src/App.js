import React, { useEffect, useState } from "react";
import "./App.css";
import "animate.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Auth/Login";
import Logout from "./Auth/Logout";
import Register from "./Auth/Register";
import Sidebar from "./Components/Sidebar";
import { DateProvider } from "./Components/Date";
import { TaskProvider } from "./Components/Taskcontaxt";
import ForgetEmail from "./Auth/ForgetEmail";
import ForgetPass from "./Auth/ForgetPass";
import Otp from "./Auth/Otp";
import ForgetOtp from "./Auth/ForgetOtp";
import NotFound from "./Components/NotFound";
import Loader from "./Components/Loader";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const userdata = () => {
      const userData = JSON.parse(localStorage.getItem("userid"));
      if (!user) {
        if (userData) {
          setUser(userData);
        } else {
          localStorage.removeItem("userId");
        }
      } else {
        localStorage.removeItem("userId");
      }
    };

    userdata();
    setTimeout(() => {
      setLoading(false);
      setTimeout(() => setContentVisible(true), 100); // Delay for fade-in
    }, 2000);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={`App ${contentVisible ? "fade-in" : ""}`}>
      <DateProvider>
        <TaskProvider>
          <BrowserRouter>
            {user && <Sidebar />}
            <Routes>
              <Route
                path="/"
                element={
                  user ? <Navigate to="/home" /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/login"
                element={user ? <Navigate to="/home" /> : <Login />}
              />
              <Route
                path="/register"
                element={user ? <Navigate to="/home" /> : <Register />}
              />
              <Route
                path="/otp"
                element={user ? <Navigate to="/home" /> : <Otp />}
              />
              <Route
                path="/forgetotp"
                element={user ? <Navigate to="/home" /> : <ForgetOtp />}
              />
              <Route path="/logout" element={<Logout />} />
              <Route
                path="/forget"
                element={user ? <Navigate to="/home" /> : <ForgetEmail />}
              />
              <Route
                path="/forgetpassword"
                element={user ? <Navigate to="/home" /> : <ForgetPass />}
              />
              <Route path="*" element={!user ? <NotFound /> : ""} />
            </Routes>
          </BrowserRouter>
        </TaskProvider>
      </DateProvider>
    </div>
  );
}

export default App;
