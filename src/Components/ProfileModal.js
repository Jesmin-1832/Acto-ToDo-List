
import React, { useState, useRef, useEffect } from "react";
import "./css/profileModal.css";
import {
  Modal,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useNavigate } from "react-router-dom";
import { FaRegUser, FaWindowClose } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import { IoCamera } from "react-icons/io5";
import Axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { API_BASE_URL } from "./ApiMain";

const ProfileModal = ({ open, handleClose }) => {
  const fileInputRef = useRef(null);
  const firstNameRef = useRef(null);
  const phoneInputRef = useRef(null);

  const [userid, setUserid] = useState(null);
  const DEFAULT_IMAGE_URL = "https://testtodolistapi.actoscript.com/staticimage/userIcon.jpg";
  const [user, setUser] = useState({
    FIRSTNAME: "",
    LASTNAME: "",
    MobileNo: "",
    UserEmailId: "",
    Image: DEFAULT_IMAGE_URL,
    userId: "",
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error states
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  let navigate = useNavigate();

  useEffect(() => {
    if (open) {
      const userinfo = JSON.parse(localStorage.getItem("userinfo"));
      if (userinfo) {
        setUser({
          FIRSTNAME: userinfo.FIRSTNAME || "",
          LASTNAME: userinfo.LASTNAME || "",
          MobileNo: userinfo.MobileNo || "",
          UserEmailId: userinfo.UserEmailId || "",
          Image: userinfo.Image || DEFAULT_IMAGE_URL,
          userId: userinfo.userId || "",
        });
        if (firstNameRef.current) {
          firstNameRef.current.focus();
        }
      }
    }
  }, [open]);

  useEffect(() => {
    const storedUserid = JSON.parse(localStorage.getItem("userid"));
    if (storedUserid) {
      setUserid(storedUserid);
    } else {
      setUserid(null);
    }
  }, []);

  const getInputValue = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    setApiError("");
  };

  const handlePhoneChange = (value) => {
    setUser((prevUser) => ({ ...prevUser, MobileNo: value }));
    setErrors((prevErrors) => ({ ...prevErrors, MobileNo: "" }));
    setApiError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, JPEG, and PNG formats are allowed.");
        handleClose();
        return;
      }
      if (file.size > 3 * 1024 * 1024) {
        toast.error("Image size not greater than 3MB.");
        handleClose();
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setUser((prevUser) => ({ ...prevUser, Image: reader.result }));
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateInputs = () => {
    let valid = true;
    let tempErrors = {};

    if (!user.FIRSTNAME.trim()) {
      tempErrors.FIRSTNAME = "First name is required.";
      valid = false;
    }

    if (!user.LASTNAME.trim()) {
      tempErrors.LASTNAME = "Last name is required.";
      valid = false;
    }

    if (!user.MobileNo) {
      tempErrors.MobileNo = "Phone number is required.";
      valid = false;
    }

    if (!user.UserEmailId.trim()) {
      tempErrors.UserEmailId = "Email is required.";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(user.UserEmailId)) {
      tempErrors.UserEmailId = "Email format is invalid.";
      valid = false;
    }

    setErrors(tempErrors);
    return valid;
  };

  const submitData = (e) => {
    e.preventDefault();

    if (validateInputs()) {
      setIsSubmitting(true);

      const imageToSubmit = user.Image.startsWith("data:image") ? user.Image : "";

      Axios.post(`${API_BASE_URL}/Register/UpdateProfile`, {
        LoginId: userid,
        FIRSTNAME: user.FIRSTNAME,
        LASTNAME: user.LASTNAME,
        UserEmailId: user.UserEmailId,
        MobileNo: user.MobileNo,
        ImageFile: imageToSubmit,
      })
        .then((res) => {
          toast.success("Profile Updated Successfully.");
          localStorage.setItem("userinfo", JSON.stringify(user));
          window.dispatchEvent(new Event("userProfileUpdated"));
          handleClose();
        })
        .catch((err) => {
          setApiError("Something went wrong.");
          console.error("Submit error:", err);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } else {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = () => {
    Axios.post(`${API_BASE_URL}/Login/deleteaccount`, { LoginId: userid })
      .then((res) => {
        toast.success("Account Deleted Successfully.");
        window.dispatchEvent(new Event("userAccountDeleted"));
        handleClose();
        navigate("/logout");
      })
      .catch((err) => {
        toast.error("Failed to delete account.");
        console.error("Delete error:", err);
      });
  };

  const openImagePreview = () => {
    setImagePreviewOpen(true);
  };

  const closeModal = () => {
    setErrors({});
    setApiError("");
    setUser({
      FIRSTNAME: "",
      LASTNAME: "",
      MobileNo: "",
      UserEmailId: "",
      Image: DEFAULT_IMAGE_URL,
      userId: "",
    });
    handleClose(); // Call the passed-in handleClose function to manage modal state
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={closeModal} // Use the updated handleClose function here
      >
        <div className="profileModal">
          <div className="ProfileForm">
            <p onClick={closeModal} className="closeLink">
              <Close />
            </p>
            <h3>Profile Information</h3>
            <form onSubmit={submitData}>
              <table width="100%">
                <tbody>
                  <tr>
                    <td>
                      <div className="avatar-upload">
                        <div className="avatar-edit">
                          <input
                            className="userImage"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                            id="imageUpload"
                          />
                          <label htmlFor="imageUpload">
                            <IoCamera />
                          </label>
                        </div>
                        <div className="avatar-preview">
                          <div
                            id="imagePreview"
                            style={{
                              backgroundImage: `url(${user.Image})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              cursor: "pointer",
                            }}
                            onClick={openImagePreview}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <input
                        type="text"
                        name="FIRSTNAME"
                        placeholder="Enter First Name..."
                        value={user.FIRSTNAME}
                        onChange={getInputValue}
                        ref={firstNameRef}
                        className={errors.FIRSTNAME ? "input-error2" : ""}
                      />
                      {errors.FIRSTNAME && <span className="errorMessage">{errors.FIRSTNAME}</span>}
                      <div className="icon">
                        <FaRegUser />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <input
                        type="text"
                        name="LASTNAME"
                        placeholder="Enter Last Name..."
                        value={user.LASTNAME}
                        onChange={getInputValue}
                        onKeyDown={(e) => {
                          if (e.key === "Tab") {
                            e.preventDefault();
                            phoneInputRef.current.focus();
                          }
                        }}
                        className={errors.LASTNAME ? "input-error2" : ""}
                      />
                      {errors.LASTNAME && <span className="errorMessage">{errors.LASTNAME}</span>}
                      <div className="icon">
                        <FaRegUser />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <PhoneInput
                        international
                        defaultCountry="IN"
                        name="MobileNo"
                        value={user.MobileNo}
                        onChange={handlePhoneChange}
                        ref={phoneInputRef}
                        className={errors.MobileNo ? "input-error" : ""}
                      />
                      {errors.MobileNo && <span className="errorMessage">{errors.MobileNo}</span>}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <input
                        type="text"
                        name="UserEmailId"
                        placeholder="Enter Email..."
                        value={user.UserEmailId}
                        onChange={getInputValue}
                        className={errors.UserEmailId ? "input-error2" : ""}
                      />
                      {errors.UserEmailId && <span className="errorMessage">{errors.UserEmailId}</span>}
                      <div className="icon">
                        <FiMail />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="d-flex justify-content-between">
                      <input
                        className="closeBtn"
                        type="button"
                        value="Close"
                        onClick={closeModal}
                        style={{ color: "white", backgroundColor: "black" }}
                      />
                      <input
                        className="submitBtn"
                        type="submit"
                        value={isSubmitting ? "Updating..." : "Submit"}
                        disabled={isSubmitting}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p
                        className="deleteAccount"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        Delete Account
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </form>
          </div>
        </div>
      </Modal>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleDeleteAccount();
              setDeleteDialogOpen(false);
            }}
            color="secondary"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Modal
        open={imagePreviewOpen}
        onClose={() => setImagePreviewOpen(false)}
        className="imagePreviewModal"
      >
        <div className="imagePreviewContainer">
          <div style={{ position: "relative" }}>
            <img
              src={imagePreviewUrl || user.Image}
              alt="Profile"
              className="imagePreview"
            />
            <button
              className="closeImagePreview"
              onClick={() => setImagePreviewOpen(false)}
            >
              <FaWindowClose />
            </button>
          </div>
        </div>
      </Modal>
      <Toaster />
    </div>
  );
};

export default ProfileModal;
