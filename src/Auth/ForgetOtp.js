
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaAngleLeft } from "react-icons/fa6";
import OTPInput from "otp-input-react";
import toast, { Toaster } from "react-hot-toast";
import Axios from "axios";
import "./css/forgetotp.css";
import { API_BASE_URL } from "../Components/ApiMain"; // Adjust the import as needed

function ForgetOtp() {
  const [OTP, setOTP] = useState("");
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState(""); // State for error messages
  let navigate = useNavigate();

  useEffect(() => {
    let otpvarified = localStorage.getItem("forgetotp");
    if (!otpvarified) {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else {
      setIsResendDisabled(false);
    }
  }, [timer]);

  const resendOtp = async () => {
    setIsResendDisabled(true);
    setTimer(60);

    const email = JSON.parse(localStorage.getItem("forgetemail"));
    console.log(email);

    if (email) {
      try {
        const response = await Axios.post(`${API_BASE_URL}/Login/CheckEmail`, {
          UserEmailId: email,
        });

        const newOtp = response.data.OTP;
        localStorage.setItem("forgetotp", newOtp);

        toast.success("OTP resent successfully!");
      } catch (err) {
        console.error("Error resending OTP:", err);
        toast.error("Error resending OTP. Please try again.");
        setIsResendDisabled(false);
      }
    } else {
      toast.error("Email not found. Please try again.");
    }
  };

  const validateOTP = (otp) => {
    if (otp.length !== 6) {
      setError("Enter a 6-digit OTP.");
      return false;
    }
    return true;
  };

  const handleOTPChange = (otp) => {
    setOTP(otp);
    // Clear error when OTP input changes
    if (error) {
      setError("");
    }
  };

  const submitData = async (e) => {
    e.preventDefault();

    if (!validateOTP(OTP)) {
      return; // Stop form submission if validation fails
    }

    const storedOtp = localStorage.getItem("forgetotp");

    if (OTP === storedOtp) {
      toast.success("OTP verified successfully!");
      window.location = "/forgetpassword";
    } else {
      setError("Invalid OTP. Please try again."); // Set error message
    }
  };

  return (
    <div>
      <div className="forgetotpDetails">
        <div className="forgetotpForm">
          <Link to="/forget" className="loginLink">
            <FaAngleLeft />
          </Link>
          <div className="forgetotpHeading">
            <h1>Forget OTP</h1>
            <p>Enter the OTP sent to your email or phone...</p>
          </div>
          <form method="post" onSubmit={submitData} style={{ position: "relative" }}>
            <OTPInput
              className="otpInput"
              value={OTP}
              onChange={handleOTPChange} // Update handler for real-time validation
              autoFocus
              OTPLength={6}
              otpType="number"
              disabled={false}
              secure={false}
            />
            {error && <span className="errorMessage">{error}</span>} {/* Display error message */}
            <div>
              <input className="submitBtn" type="submit" value="Submit OTP" />
            </div>
          </form>
          <div>
            <button
              className="resendBtn"
              onClick={resendOtp}
              disabled={isResendDisabled}
            >
              {isResendDisabled ? `Resend OTP in ${timer}s` : "Resend OTP"}
            </button>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default ForgetOtp;
