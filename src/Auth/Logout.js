import { useEffect } from "react";
import { Link } from "react-router-dom";

function Logout() {
  useEffect(() => {
    localStorage.removeItem("userid");
    localStorage.removeItem("selectedDate");
    localStorage.removeItem("userinfo");
    localStorage.removeItem("Image");
    localStorage.removeItem("lastTaskDateTime");
    window.location = "/login";
  });
}

export default Logout;
