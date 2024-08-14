// Components/NotFound.js
import React from "react";
import './css/notFound.css'
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div>
      <div className="pageNotfound">
        <h2>404</h2>
        <h3>Page Not Found</h3>
        <p>Sorry, the page you are looking for does not exist. <Link to={"/login"}>Please Login First..</Link></p>
      </div>
    </div>
  );
}

export default NotFound;
