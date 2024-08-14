
import "./css/LoginPage.css";
import "react-toastify/dist/ReactToastify.css";
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import { MdLockOutline } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { API_BASE_URL } from "../Components/ApiMain";

function Login() {
  const [user, setUser] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state

  const phoneInputRef = useRef();

  useEffect(() => {
    if (phoneInputRef.current) {
      phoneInputRef.current.focus();
    }
  }, []);

  const handleInputChange = (value, name) => {
    setUser({ ...user, [name]: value });
    setErrors({ ...errors, [name]: "" });
    setApiError("");
  };

  const validateInputs = () => {
    let valid = true;
    let tempErrors = {};

    if (!user.number) {
      tempErrors.number = "Phone number is required.";
      valid = false;
    }

    if (!user.password) {
      tempErrors.password = "Password is required.";
      valid = false;
    }

    setErrors(tempErrors);
    return valid;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handlesubmit = async (e) => {
    e.preventDefault();

    if (validateInputs()) {
      setLoading(true); // Disable the submit button
      try {
        const response = await Axios.post(
          `${API_BASE_URL}/Login`,
          {
            MobileNo: user.number,
            Password: user.password,
            FCMToken:
              "e9ONAqIgQMih5afMCTPDUf:APA91bH5iN_sL8sls2y7qEEO0vf5siT-fgqoUU_Qyhxcu2V23XEwyujLf11JafYhF7Dxlb1q85V571ezfMYVh8e-H_JFUN1kRjcpaxq5kBWRXVSVLaHM4_qFjvuiXH9epFFIW8t2Z60A",
          },
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        localStorage.setItem("userinfo", JSON.stringify(response.data));
        localStorage.setItem("userid", JSON.stringify(response.data.LoginId));
        toast.success("Login Successfully..", {});
        setTimeout(() => {
          window.location = "/home";
        }, 1000);
      } catch (err) {
        console.error("Something went wrong.", err);
        setApiError("Invalid phone number or password."); // Display error message
        setLoading(false); // Re-enable the submit button if there's an error
      }
    } else {
      setLoading(false); // Re-enable the submit button if validation fails
    }
  };

  return (
    <div>
      <div className="LoginDetails">
        <div className="LoginContent">
          <div className="LoginForm">
            <h1>Welcome.</h1>
            <p>To do list...</p>
            <form onSubmit={handlesubmit}>
              <table width="100%">
                <tbody>
                  <tr>
                    <td>
                      <PhoneInput
                        ref={phoneInputRef} // Attach the ref to the PhoneInput component
                        international
                        defaultCountry="IN"
                        name="number"
                        value={user.number || ""}
                        onChange={(value) => handleInputChange(value, "number")}
                        className={errors.number ? "input-error" : ""}
                      />
                      {errors.number && <span className="errorMessage">{errors.number}</span>}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <input
                        type={showPassword ? "text" : "password"}
                        autoComplete="off"
                        placeholder="Password"
                        name="password"
                        value={user.password || ""}
                        onChange={(e) =>
                          handleInputChange(e.target.value, "password")
                        }
                        className={errors.password ? "input-error2" : ""}
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
                      {errors.password && <span className="errorMessage">{errors.password}</span>}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p className="forgetLink">
                        <Link to="/forget">Forget Password?</Link>
                      </p>
                    </td>
                  </tr>
                  {apiError && (
                    <tr>
                      <td>
                        <span className="apiErrorMessage">Invalid Credentials..</span>
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td>
                      <input
                        type="submit"
                        className="LoginBtn"
                        value="Log in"
                        disabled={loading}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </form>
            <div className="d-flex justify-content-center"></div>
            <div className="RegisterLink">
              <p>
                New to ? <Link to="/register">Register here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default Login;
