
import "./css/otp.css";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaAngleLeft } from "react-icons/fa6";
import OTPInput from "otp-input-react";
import toast, { Toaster } from "react-hot-toast";
import Axios from "axios";
import { API_BASE_URL } from "../Components/ApiMain";

const DEFAULT_IMAGE_URL =
  "https://testtodolistapi.actoscript.com/staticimage/userIcon.jpg";

function Otp() {
  const [OTP, setOTP] = useState("");
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState(""); // State for error messages
  let navigate = useNavigate();

  useEffect(() => {
    let otpVerified = localStorage.getItem("otp");
    if (!otpVerified) {
      navigate("/login");
    }
  }, [navigate]);

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

    const registrationData = JSON.parse(
      localStorage.getItem("registrationData")
    );
    if (registrationData) {
      try {
        let otpRes = await Axios.post(`${API_BASE_URL}/Register/SendOTP`, {
          UsermailId: registrationData.email,
          FirstName: registrationData.firstName,
          MobileNo: registrationData.phoneNumber,
        });

        if (otpRes.data.ResponseMessage === "User already exists") {
          toast.error("User already exists..!");
          return;
        }

        localStorage.setItem("otp", otpRes.data.OTP);

        toast.success("OTP resent successfully!");
      } catch (err) {
        console.error("Error resending OTP:", err);
        toast.error("Error resending OTP. Please try again.");
        setIsResendDisabled(false);
      }
    } else {
      toast.error("Registration data not found. Please try again.");
      setIsResendDisabled(false);
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

    const storedOtp = localStorage.getItem("otp");
    const registrationData = JSON.parse(
      localStorage.getItem("registrationData")
    );

    if (OTP === storedOtp) {
      if (!registrationData) {
        toast.error("No registration data found. Please register again.");
        return;
      }

      try {
        const imageFile =
          registrationData.userImage === DEFAULT_IMAGE_URL
            ? ""
            : registrationData.userImage;

        console.log("Payload being sent:", {
          FIRSTNAME: registrationData.firstName,
          LASTNAME: registrationData.lastName,
          PassWord: registrationData.password,
          UserEmailId: registrationData.email,
          MobileNo: registrationData.phoneNumber,
          ImageFile: imageFile,
          FCMToken:
            "e9ONAqIgQMih5afMCTPDUf:APA91bH5iN_sL8sls2y7qEEO0vf5siT-fgqoUU_Qyhxcu2V23XEwyujLf11JafYhF7Dxlb1q85V571ezfMYVh8e-H_JFUN1kRjcpaxq5kBWRXVSVLaHM4_qFjvuiXH9epFFIW8t2Z60A",
        });

        const res = await Axios.post(`${API_BASE_URL}/Register`, {
          FIRSTNAME: registrationData.firstName,
          LASTNAME: registrationData.lastName,
          PassWord: registrationData.password,
          UserEmailId: registrationData.email,
          MobileNo: registrationData.phoneNumber,
          ImageFile: imageFile,
          FCMToken:
            "e9ONAqIgQMih5afMCTPDUf:APA91bH5iN_sL8sls2y7qEEO0vf5siT-fgqoUU_Qyhxcu2V23XEwyujLf11JafYhF7Dxlb1q85V571ezfMYVh8e-H_JFUN1kRjcpaxq5kBWRXVSVLaHM4_qFjvuiXH9epFFIW8t2Z60A",
        });

        const { LoginId } = res.data;
        localStorage.setItem("userinfo", JSON.stringify(res.data));
        localStorage.setItem("userid", LoginId);

        localStorage.removeItem("otp");
        localStorage.removeItem("registrationData");

        toast.success("OTP verified successfully!");
        setOTP("");
        navigate("/login");
      } catch (err) {
        console.error("Registration error:", err);
        toast.error("Error registering user. Please try again.");
      }
    } else {
      setError("Invalid OTP. Please try again."); // Set error message
    }

  };

  return (
    <div>
      <div className="otpDetails">
        <div className="otpForm">
          <Link to="/register" className="loginLink">
            <FaAngleLeft />
          </Link>
          <div className="otpHeading">
            <h1>OTP</h1>
            <p>Enter the OTP sent to your email...</p>
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
              <input className="submitBtn" type="submit" value="Verify OTP" />
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

export default Otp;
