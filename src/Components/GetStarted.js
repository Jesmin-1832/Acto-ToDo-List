import "./css/getstarted.css";
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect } from "react";

function GetStarted() {
  useEffect(() => {
    let userData = JSON.parse(localStorage.getItem("userid"));
    if (userData != null) {
      navigate("/login");
    }
  }, []);

  return (
    <div>
      <div className="getStarted">
        <img src={require("../images/Group 65.png")} alt="" />
        <h2>Manage your every day task here</h2>
        <p>
          Task management is the process of creating, prioritizing, delegating,
          and monitoring tasks to ensure they are completed within given
          deadlines.
        </p>
        <Link className="startBtn" to={"/login"}>
          Get Started
        </Link>
      </div>
    </div>
  );
}

export default GetStarted;
