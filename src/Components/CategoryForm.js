import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import CloseIcon from "@mui/icons-material/Close";
import "./css/myProjectsModal.css";
import Axios from "axios";
import { API_BASE_URL } from "./ApiMain";

const CategoryForm = ({ open, handleClose, categoryedit, handleSave }) => {
  const [categoryName, setCategoryName] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState(""); // Error state

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userid"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  useEffect(() => {
    if (categoryedit) {
      setCategoryName(categoryedit.GroupName); // Initialize the category name if editing
    }
  }, [categoryedit]);

  useEffect(() => {
    if (!open) {
      // Reset state when modal is closed
      setCategoryName("");
      setError("");
    }
  }, [open]);

  const handleCategoryNameChange = (e) => {
    setCategoryName(e.target.value);
    setError(""); // Clear error message on input change
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!user) {
      toast.error("User not found.");
      return;
    }

    if (!validateCategory()) {
      return; // Prevent form submission if validation fails
    }

    if (categoryedit) {
      // Update existing category
      Axios.post(`${API_BASE_URL}/Group/Updatecategory`, {
        GroupId: categoryedit.GroupId, // Assuming you have GroupId for updating
        GroupName: categoryName,
        LoginId: user,
      })
        .then(() => {
          handleSave({ ...categoryedit, GroupName: categoryName });
          handleClose();
          toast.success("Category updated successfully.", {
            position: "bottom-left",
          });
        })
        .catch((err) => {
          console.error("Error updating category:", err);
          toast.error("Failed to update category.");
        });
    } else {
      // Add new category
      Axios.post(`${API_BASE_URL}/Group/Addcategory`, {
        GroupName: categoryName,
        LoginId: user,
      })
        .then(() => {
          handleSave({ GroupName: categoryName }); // Pass new category to handleSave
          handleClose();
          toast.success("Category added successfully.", {
            position: "bottom-left",
          });
        })
        .catch((err) => {
          console.error("Error adding category:", err);
          toast.error("Failed to add category.");
        });
    }
  };

  const validateCategory = () => {
    if (!categoryName.trim()) {
      setError("Category name is required.");
      return false;
    }
    return true;
  };

  return (
    <>
      {open && (
        <div className="myprojecttask">
          <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">
                  {categoryedit ? "Edit Category" : "Add Category"}
                </h2>
                <CloseIcon onClick={handleClose} className="close-button" />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <input
                    type="text"
                    name="category"
                    placeholder="Enter Category Name"
                    autoFocus // autofocus input field when modal is opened
                    value={categoryName}
                    onChange={handleCategoryNameChange}
                    className={error ? "input-error2" : ""}
                  />
                  {error && <span className="categoryError">{error}</span>}
                  <div>
                    <input
                      type="button"
                      value="Close"
                      onClick={handleClose}
                      className="btn btn-secondary"
                    />
                    <input
                      type="submit"
                      value={categoryedit ? "Save Changes" : "Add Category"}
                      className="btn btn-primary"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <Toaster />
    </>
  );
};

export default CategoryForm;
