
import "./css/RegisterPage.css";
import { useState, useRef, useEffect } from "react";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { Link, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { FaRegUser } from "react-icons/fa6";
import { MdLockOutline } from "react-icons/md";
import { FiMail } from "react-icons/fi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaAngleLeft } from "react-icons/fa6";
import { IoCamera } from "react-icons/io5";
import { GrPowerReset } from "react-icons/gr";
import toast, { Toaster } from "react-hot-toast";
import Axios from "axios";
import { API_BASE_URL } from "../Components/ApiMain";

// Function to convert image to base64
const convertImageToBase64 = (image) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(image);
  });
};

function Register() {
  const DEFAULT_IMAGE_URL =
    "https://testtodolistapi.actoscript.com/staticimage/userIcon.jpg";
  const fileInputRef = useRef(null);
  const firstNameInputRef = useRef(null); // Ref for first name input
  const lastNameInputRef = useRef(null); // Ref for last name input
  const phoneInputRef = useRef(null); // Ref for phone input

  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    userImage: DEFAULT_IMAGE_URL,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isDefaultImage, setIsDefaultImage] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Track form submission state
  let navigate = useNavigate();

  useEffect(() => {
    firstNameInputRef.current.focus(); // Focus on first name input on component mount
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getInputValue = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setUser({ ...user, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handlePhoneNumberChange = (value) => {
    setUser({ ...user, phoneNumber: value });
    setErrors({ ...errors, phoneNumber: "" });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      convertImageToBase64(file)
        .then((base64) => setUser({ ...user, userImage: base64 }))
        .catch((error) =>
          console.error("Error converting image to base64:", error)
        );
      setIsDefaultImage(false);
    }
  };

  const removeImage = () => {
    setUser((prevUser) => ({ ...prevUser, userImage: DEFAULT_IMAGE_URL }));
    setIsDefaultImage(true);
    fileInputRef.current.value = null;
  };

  const validateInputs = () => {
    let valid = true;
    let tempErrors = {};

    const { firstName, lastName, phoneNumber, email, password } = user;

    if (!firstName) {
      tempErrors.firstName = "First Name is required.";
      valid = false;
    }

    if (!lastName) {
      tempErrors.lastName = "Last Name is required.";
      valid = false;
    }

    if (!phoneNumber) {
      tempErrors.phoneNumber = "Phone Number is required.";
      valid = false;
    }

    if (!email) {
      tempErrors.email = "Email is required.";
      valid = false;
    }

    if (!password) {
      tempErrors.password = "Password is required.";
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      tempErrors.email = "Invalid Email Format!";
      valid = false;
    }

    const phoneRegex =
      /^(?:\+?(\d{1,3}))?[\s-]?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}$/;
    if (phoneNumber) {
      const cleanedPhoneNumber = phoneNumber.replace(/[^0-9]/g, "");

      if (
        cleanedPhoneNumber.length < 10 ||
        cleanedPhoneNumber.length > 12 ||
        !phoneRegex.test(phoneNumber)
      ) {
        tempErrors.phoneNumber = "Invalid Phone Number!";
        valid = false;
      }
    }

    setErrors(tempErrors);
    return valid;
  };

  const submitData = async (e) => {
    e.preventDefault();

    if (validateInputs()) {
      setIsSubmitting(true); // Disable the button to prevent multiple submissions
      try {
        // Send OTP
        let otpRes = await Axios.post(`${API_BASE_URL}/Register/SendOTP`, {
          UsermailId: user.email,
          FirstName: user.firstName,
          MobileNo: user.phoneNumber,
        });

        if (otpRes.data.ResponseMessage === "User already exists") {
          toast.error("User already exists..!");
          setIsSubmitting(false); // Re-enable the button in case of error
          return;
        }

        toast.success("OTP sent successfully, please wait..");

        // Store registration details and OTP
        localStorage.setItem("registrationData", JSON.stringify(user));
        localStorage.setItem("otp", otpRes.data.OTP);

        // Redirect to OTP page
        navigate("/otp");
      } catch (err) {
        if (err.response && err.response.status === 400) {
          toast.error("User already exists!");
        } else {
          toast.error("Something went wrong");
        }
        setIsSubmitting(false); // Re-enable the button in case of error
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab" && e.target.name === "lastName") {
      e.preventDefault(); // Prevent default Tab behavior
      phoneInputRef.current.focus(); // Focus on phone input
    }
  };

  return (
    <div>
      <div className="RegisterDetails">
        <div className="registerForm">
          <Link to="/login" className="loginLink">
            <FaAngleLeft />
          </Link>
          <div style={{ marginLeft: "30px" }}>
            <h1>Register.</h1>
            <p>To do list...</p>
          </div>
          <form method="post" onSubmit={submitData}>
            <table width="100%">
              <tbody>
                <tr>
                  <td>
                    <div className="avatar-upload">
                      <div className="avatar-edit">
                        <input
                          className="userImage"
                          type="file"
                          name="userImage"
                          accept="image/*"
                          onChange={handleImageUpload}
                          id="imageUpload"
                          ref={fileInputRef}
                        />
                        <label htmlFor="imageUpload">
                          <IoCamera />
                        </label>
                      </div>
                      <div className="avatar-preview">
                        <div
                          id="imagePreview"
                          style={{
                            backgroundImage: `url(${user.userImage})`,
                          }}
                        ></div>
                      </div>
                      {!isDefaultImage && (
                        <button
                          type="button"
                          className="removeImageBtn"
                          onClick={removeImage}
                        >
                          <GrPowerReset />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input
                      type="text"
                      name="firstName"
                      autoComplete="off"
                      placeholder="Enter First Name..."
                      value={user.firstName}
                      onChange={getInputValue}
                      className={errors.firstName ? "input-error2" : ""}
                      ref={firstNameInputRef} // Attach ref to first name input
                    />
                    <div className="icon">
                      <FaRegUser />
                    </div>
                    {errors.firstName && <span className="errorMessage">{errors.firstName}</span>}
                  </td>
                </tr>
                <tr>
                  <td>
                    <input
                      type="text"
                      name="lastName"
                      autoComplete="off"
                      placeholder="Enter Last Name..."
                      value={user.lastName}
                      onChange={getInputValue}
                      onKeyDown={handleKeyDown} // Handle Tab key for last name input
                      className={errors.lastName ? "input-error2" : ""}
                      ref={lastNameInputRef} // Attach ref to last name input
                    />
                    <div className="icon">
                      <FaRegUser />
                    </div>
                    {errors.lastName && <span className="errorMessage">{errors.lastName}</span>}
                  </td>
                </tr>
                <tr>
                  <td>
                    <PhoneInput
                      international
                      defaultCountry="IN"
                      name="phoneNumber"
                      value={user.phoneNumber}
                      onChange={handlePhoneNumberChange}
                      className={errors.phoneNumber ? "input-error" : ""}
                      ref={phoneInputRef} // Attach ref to phone input
                    />
                    {errors.phoneNumber && <span className="errorMessage">{errors.phoneNumber}</span>}
                  </td>
                </tr>
                <tr>
                  <td>
                    <input
                      type="text"
                      name="email"
                      autoComplete="off"
                      placeholder="Enter Email..."
                      value={user.email}
                      onChange={getInputValue}
                      className={errors.email ? "input-error2" : ""}
                    />
                    <div className="icon">
                      <FiMail />
                    </div>
                    {errors.email && <span className="errorMessage">{errors.email}</span>}
                  </td>
                </tr>
                <tr>
                  <td>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={user.password}
                      onChange={getInputValue}
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
                    <input
                      className="submitBtn"
                      type="submit"
                      value={isSubmitting ? "Submitting..." : "Register"} // Update button text
                      disabled={isSubmitting} // Disable button during submission
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </div>
      </div>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
        }}
      />
    </div>
  );
}

export default Register;
