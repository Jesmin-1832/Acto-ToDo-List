
import "./css/ForgetPage.css";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { FiMail } from "react-icons/fi";
import Axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { API_BASE_URL } from "../Components/ApiMain";

export default function ForgetEmail() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  let navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userId"));
    if (userData !== null) {
      navigate("/home");
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    setErrors({ ...errors, email: "" });
    setApiError(""); // Clear API error when input changes
  };

  const validateInputs = () => {
    let valid = true;
    let tempErrors = {};

    if (!email) {
      tempErrors.email = "Email is required.";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = "Email is not valid.";
      valid = false;
    }

    setErrors(tempErrors);
    return valid;
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (validateInputs()) {
      setLoading(true);
      try {
        const response = await Axios.post(`${API_BASE_URL}/Login/CheckEmail`, {
          UserEmailId: email,
        });

        if (response.data.UserEmailId) {
          toast.success("OTP Sent Successfully, Please wait!");

          try {
            const otpResponse = await Axios.post(
              `${API_BASE_URL}/Login/CheckEmail`,
              {
                UserEmailId: email,
              }
            );

            localStorage.setItem("forgetemail", JSON.stringify(email));
            localStorage.setItem(
              "forgetotp",
              JSON.stringify(otpResponse.data.OTP)
            );

            setEmail("");

            setTimeout(() => {
              window.location = "/forgetotp";
            }, 800);
          }
          catch (err) {
            toast.error("Error sending OTP. Please try again.");
          }
        } else {
          toast.error("Email does not exist.");
          setApiError("The provided email is not registered.");
        }
      } catch (err) {
        console.error("Error checking email:", err);
        setApiError("Invalid Email. Please enter a valid Email.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <div className="forgetDetails">
        <div className="forgetContent">
          <div className="forgetForm">
            <h1>Forget Password</h1>
            <p>To do list...</p>
            <form onSubmit={handleUpdateSubmit}>
              <table width="100%">
                <tbody>
                  <tr>
                    <td>
                      <input
                        type="text"
                        autoComplete="off"
                        placeholder="Email Address"
                        name="email"
                        value={email}
                        onChange={handleInputChange}
                        className={errors.email ? "input-error2" : ""}
                      />
                      <div className="icon">
                        <FiMail />
                      </div>
                      {errors.email && (
                        <span className="errorMessage">{errors.email}</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span>
                        Provide your account’s email for which you want to reset
                        your password!
                      </span>
                    </td>
                  </tr>
                  {apiError && (
                    <tr>
                      <td>
                        <span className="apiErrorMessage">{apiError}</span>
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td>
                      <input
                        type="submit"
                        className="forgetBtn"
                        value={loading ? "Sending...⏳" : "Next"}
                        disabled={loading}
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
