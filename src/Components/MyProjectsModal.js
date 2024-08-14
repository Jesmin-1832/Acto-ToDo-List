
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import CloseIcon from "@mui/icons-material/Close";
import "./css/myProjectsModal.css";
import Axios from "axios";
import { API_BASE_URL } from "./ApiMain";

const MyProjectsModal = ({
  open,
  handleClose,
  addProject,
  project,
  editingProject,
}) => {
  const [user, setUser] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState(""); // Added error state

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userid"));
    if (user) {
      setUser(user);
    }

    if (editingProject) {
      setProjectName(editingProject.ProjectName);
    } else {
      setProjectName("");
    }
  }, [editingProject]);

  const validateProjectName = () => {
    if (!projectName.trim()) {
      setError("Project name cannot be empty.");
      return false;
    }
    setError(""); // Clear error if validation passes
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateProjectName()) {
      return; // Prevent form submission if validation fails
    }

    if (editingProject) {
      Axios.post(`${API_BASE_URL}/Project/Update`, {
        ProjectId: editingProject.ProjectId,
        ProjectName: projectName,
        LoginId: user,
      })
        .then(() => {
          toast.success("Project updated successfully.", {
            position: "bottom-left",
          });
          handleClose();
          project();
        })
        .catch((err) => {
          toast.error("Error updating project.");
          console.error("Error updating project:", err);
        });
    } else {
      Axios.post(`${API_BASE_URL}/Project`, {
        ProjectName: projectName,
        LoginId: user,
      })
        .then(() => {
          toast.success("Project added successfully.", {
            position: "bottom-left",
          });
          handleClose();
          addProject(projectName);
          setProjectName("");
        })
        .catch((err) => {
          toast.error("Error adding project.");
          console.error("Error adding project:", err);
        });
    }
  };

  return (
    <>
      {open && (
        <div className="myprojecttask">
          <div className="modal-overlay" onClick={() => {
            handleClose();
            setError(""); // Clear error when modal is closed
          }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">
                  {editingProject ? "Edit Project" : "Add Project"}
                </h2>
                <CloseIcon onClick={() => {
                  handleClose();
                  setError(""); // Clear error when modal is closed
                }} className="close-button" />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <input
                    type="text"
                    name="projectName"
                    placeholder="Enter Project Name"
                    autoFocus="true"
                    value={projectName}
                    onChange={(e) => {
                      setProjectName(e.target.value);
                      setError(""); // Clear error message on input change
                    }}
                    className={error ? "input-error2" : ""}
                  />
                  {error && <span className="projectError">{error}</span>}
                  <div>
                    <input
                      type="button"
                      value="Close"
                      onClick={() => {
                        handleClose();
                        setError(""); // Clear error when modal is closed
                      }}
                      className="btn btn-secondary"
                    />
                    <input
                      type="submit"
                      value={editingProject ? "Update Project" : "Add Project"}
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

export default MyProjectsModal;
