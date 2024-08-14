import "./css/ForgetPage.css";
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Axios from "axios";
import { MdLockOutline } from "react-icons/md";
import toast, { Toaster } from "react-hot-toast";
import { API_BASE_URL } from "../Components/ApiMain";

function ForgetPass() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    password: "",
    newpassword: "",
  });
  const [forgetEmail, setForgetEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // State for tracking loading

  // Create refs for the input elements
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  useEffect(() => {
    let otpVerified = localStorage.getItem("forgetotp");
    if (!otpVerified) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userId"));
    if (userData) {
      navigate("/home");
    }
  }, [navigate]);

  useEffect(() => {
    const storedForgetEmail = JSON.parse(localStorage.getItem("forgetemail"));
    if (storedForgetEmail) {
      setForgetEmail(storedForgetEmail);
    }
  }, []);

  useEffect(() => {
    // Focus on the password input field when the component mounts
    if (passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const togglePasswordVisibility1 = () => {
    setShowPassword1(!showPassword1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateInputs = () => {
    let valid = true;
    let tempErrors = {};

    if (!user.password) {
      tempErrors.password = "New password is required.";
      valid = false;
    }

    if (!user.newpassword) {
      tempErrors.newpassword = "Confirm password is required.";
      valid = false;
    }

    // Only check if passwords match if both fields are filled
    if (user.password && user.newpassword && user.password !== user.newpassword) {
      tempErrors.passwordMatch = "Passwords do not match.";
      valid = false;
    }

    setErrors(tempErrors);
    return valid;
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();

    if (validateInputs()) {
      setLoading(true); // Set loading state to true

      Axios.post(`${API_BASE_URL}/Login/updatePassword`, {
        UserEmailId: forgetEmail,
        PassWord: user.password,
      })
        .then((res) => {
          toast.success("Password changed successfully...");
          setTimeout(() => {
            navigate("/login"); // Use navigate instead of window.location
            localStorage.removeItem("forgetemail");
            localStorage.removeItem("forgetotp");
            setLoading(false); // Reset loading state
          }, 1000);
        })
        .catch((err) => {
          console.log(err);
          toast.error("Error updating password");
          setLoading(false); // Reset loading state
        });
    }
  };

  return (
    <div>
      <div className="forgetDetails">
        <div className="forgetContent">
          <div className="forgetForm">
            <h1>Set New Password</h1>
            <p>Create a new password to continue...</p>
            <form onSubmit={handleUpdateSubmit}>
              <table width="100%">
                <tbody>
                  <tr>
                    <td className="password-field">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="New Password"
                        value={user.password}
                        onChange={handleInputChange}
                        className={errors.password ? "input-error2" : ""}
                        ref={passwordInputRef} // Attach ref here
                      />
                      <div className="icon">
                        <MdLockOutline />
                      </div>
                      <div
                        className="show-hide"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                      </div>
                      {errors.password && (
                        <span className="errorMessage">{errors.password}</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="password-field">
                      <input
                        type={showPassword1 ? "text" : "password"}
                        name="newpassword"
                        placeholder="Confirm Password"
                        value={user.newpassword}
                        onChange={handleInputChange}
                        className={errors.newpassword ? "input-error2" : ""}
                        ref={confirmPasswordInputRef} // Attach ref here
                      />
                      <div className="icon">
                        <MdLockOutline />
                      </div>
                      <div
                        className="show-hide"
                        onClick={togglePasswordVisibility1}
                      >
                        {showPassword1 ? <FaEye /> : <FaEyeSlash />}
                      </div>
                      {errors.newpassword && (
                        <span className="errorMessage">{errors.newpassword}</span>
                      )}
                      {errors.passwordMatch && (
                        <span className="errorMessage passwordnotmatch">{errors.passwordMatch}</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <input
                        type="submit"
                        className="forgetBtn"
                        value={loading ? "Submitting..." : "Next"}
                        disabled={loading} // Disable button when loading
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </form>
            <div className="forgetlink">
              <p>
                Already Have An account? <Link to="/login">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default ForgetPass;
