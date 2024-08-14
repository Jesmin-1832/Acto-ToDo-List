
import React, { useState, useEffect, useRef } from "react";
import { FaChevronLeft, FaPlus, FaRegEdit } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";
import "./css/myprojecttask.css";
import Axios from "axios";
import { FiFlag } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import { GrShareOption } from "react-icons/gr";
import dayjs from "dayjs";
import { jsPDF } from "jspdf";
import { API_BASE_URL } from "./ApiMain";
import { useDate } from "./Date";
import generateprojectpdf from "./generateprojectpdf";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { FaDownload } from "react-icons/fa6";

function MyProjectsTask({ open, handleClose, editingProject, projectid }) {
  const [user, setUser] = useState(null);
  const [projectName, setProjectName] = useState("");
  const { selectedDate } = useDate();
  const [showPopup, setShowPopup] = useState(false);
  const [data, setData] = useState({ task: "", priority: "Medium", DONE: 0 });
  const [tasks, setTasks] = useState([]);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [taskspdf, Settaskpdf] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const popupRef = useRef();
  const taskInputRef = useRef();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userid"));
    if (storedUser) {
      setUser(storedUser);
    }

    if (editingProject) {
      setProjectName(editingProject.ProjectName);
    } else {
      setProjectName("");
    }
  }, [editingProject]);

  useEffect(() => {
    if (open && user && projectid) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [open, projectid, user]);

  const handleDownloadPdf = async () => {
    try {
      const response = await Axios.get(`${API_BASE_URL}/ProjectTaskPDF`, {
        params: {
          LoginId: user,
          ProjectId: projectid,
        },
      });

      const pdfData = response.data;

      if (pdfData) {
        generateprojectpdf(
          user,
          dayjs(selectedDate),
          projectName,
          pdfData,
          (pdfBlob) => {
            if (pdfBlob) {
              const url = URL.createObjectURL(pdfBlob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "TaskProjectReport.pdf";
              link.click();
              URL.revokeObjectURL(url);
              toast.success("Task PDF downloaded successfully.");
            } else {
              toast.error("Failed to generate PDF.");
            }
          }
        );
      } else {
        toast.error("No data received for PDF generation.");
      }
    } catch (error) {
      console.error("API Error:", error.response || error);
      toast.error("Failed to fetch group tasks.");
    }
  };

  const handleConfirmDownload = () => {
    setShowConfirmPopup(false);
    handleDownloadPdf();
  };

  const handleCancelDownload = () => {
    setShowConfirmPopup(false);
  };

  const fetchTasks = () => {
    Axios.get(
      `${API_BASE_URL}/ProjectTask?LoginId=${user}&ProjectId=${projectid}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => {
        const tasksList = res.data.projecttasklist;

        const priorityOrder = { High: 1, Medium: 2, Low: 3 };

        const sortedTasks = tasksList.sort((a, b) => {
          if (a.DONE !== b.DONE) {
            return a.DONE - b.DONE;
          }
          return priorityOrder[a.Priority] - priorityOrder[b.Priority];
        });

        setTasks(sortedTasks);
      })
      .catch((err) => {
        console.log("Error fetching tasks:", err);
        setTasks([]);
      });
  };

  const handleClickOutside = (e) => {
    if (popupRef.current && !popupRef.current.contains(e.target)) {
      setShowPopup(false);
    }
  };

  const togglePopup = () => {
    if (showPopup) {
      setData({ task: "", priority: "Medium", DONE: 0 });
      setEditingTaskId(null);
    }
    setShowPopup((prevState) => !prevState);
  };

  const handleInputChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handlePriorityChange = (priority) => {
    setData({
      ...data,
      priority,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const taskData = {
      ProjectId: projectid,
      LoginId: user,
      Task: data.task,
      Priority: data.priority,
      DONE: data.DONE,
    };

    if (editingTaskId) {
      Axios.post(`${API_BASE_URL}/ProjectTask/Put`, {
        ...taskData,
        ProjectTaskId: editingTaskId,
      })
        .then((res) => {
          fetchTasks();
          setShowPopup(false);
          setData({ task: "", priority: "Medium", DONE: 0 });
          setEditingTaskId(null);
          toast.success("Task updated successfully");
        })
        .catch((err) => {
          toast.error("Error updating task: " + err.message);
        });
    } else {
      Axios.post(`${API_BASE_URL}/ProjectTask`, taskData)
        .then((res) => {
          fetchTasks();
          setShowPopup(false);
          toast.success("Task added successfully");
          setData({ task: "", priority: "Medium", DONE: 0 });
        })
        .catch((err) => {
          toast.error("Error adding task: " + err.message);
        });
    }
  };

  const handleEditClick = (task) => {
    setEditingTaskId(task.ProjectTaskId);
    setData({ task: task.Task, priority: task.Priority, DONE: task.DONE });
    togglePopup();
  };

  const handleCheckboxChange = (task) => {
    const newDoneStatus = task.DONE === 1 ? 0 : 1;

    Axios.post(`${API_BASE_URL}/ProjectTask/Put`, {
      ProjectTaskId: task.ProjectTaskId,
      ProjectId: projectid,
      LoginId: user,
      Task: task.Task,
      Priority: task.Priority,
      DONE: newDoneStatus,
    })
      .then((res) => {
        fetchTasks();
        toast.success("Task status updated successfully");
      })
      .catch((err) => {
        toast.error("Error updating task status: " + err.message);
      });
  };

  return (
    <>
      <div className={`userModal ${open ? "show" : ""}`}>
        <div className="modalContent">
          <div className="modalhead d-flex align-items-center justify-content-between">
            <button className="closeButton" onClick={handleClose}>
              <FaChevronLeft />
            </button>
            <h3>{projectName}</h3>
            <div className="downloadbutton" onClick={() => setShowConfirmPopup(true)}>
              <FaDownload
                title="Download"
              />
            </div>
            <Dialog
              open={showConfirmPopup}
              onClose={handleCancelDownload}
              aria-labelledby="confirm-dialog-title"
              aria-describedby="confirm-dialog-description"
            >
              <DialogTitle id="confirm-dialog-title">
                {"Confirm Download"}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="confirm-dialog-description">
                  Are you sure you want to download Project PDF report?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCancelDownload} color="primary">
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmDownload}
                  color="primary"
                  autoFocus
                >
                  Confirm
                </Button>
              </DialogActions>
            </Dialog>
          </div>
          <div className="projectTask-inner">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div
                  key={task.ProjectTaskId}
                  className="tasklist-inner d-flex align-items-center justify-content-between"
                >
                  <div
                    className={`checkbox-container ${task.Priority.toLowerCase()}`}
                  >
                    <input
                      type="checkbox"
                      className="checktask"
                      checked={task.DONE === 1}
                      onChange={() => handleCheckboxChange(task)}
                    />
                    <p
                      style={{
                        textDecoration:
                          task.DONE === 1 ? "line-through" : "none",
                      }}
                    >
                      {task.Task}
                    </p>
                  </div>
                  <div className="projecttask-edit">
                    <FaRegEdit onClick={() => handleEditClick(task)} />
                  </div>
                </div>
              ))
            ) : (
              <img
                src="https://i.pinimg.com/originals/dd/59/ca/dd59cabdd357be5659fbac290414bb6a.jpg"
                alt="No Task Image"
                width={500}
                style={{ display: "flex", margin: "0 auto" }}
              />
            )}
          </div>
        </div>
        <div className="micro" onClick={togglePopup}>
          <FaPlus />
        </div>
      </div>

      {showPopup && (
        <div className="projecttaskPopup">
          <div className="popup-overlay" onClick={togglePopup}>
            <div className="popup-content" ref={popupRef}>
              <div className="modal-overlay">
                <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <div className="d-flex align-items-center justify-content-between modal-topbar">
                      <h2 className="modal-title">
                        {editingTaskId ? "Edit Task" : "New Task"}
                      </h2>
                      <IoIosCloseCircle
                        onClick={togglePopup}
                        className="close-button"
                      />
                    </div>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                      <textarea
                        placeholder="Enter Task Name"
                        name="task"
                        required
                        autoFocus
                        value={data.task}
                        onChange={handleInputChange}
                        ref={taskInputRef}
                        rows={3}
                      ></textarea>

                      <h3>Priority</h3>
                      <div className="priority d-flex align-items-center justify-content-between w-100">
                        <div
                          className={data.priority === "High" ? "active" : ""}
                        >
                          <button
                            type="button"
                            onClick={() => handlePriorityChange("High")}
                          >
                            <span>
                              <FiFlag />
                            </span>{" "}
                            High
                          </button>
                        </div>
                        <div
                          className={data.priority === "Medium" ? "active" : ""}
                        >
                          <button
                            type="button"
                            onClick={() => handlePriorityChange("Medium")}
                          >
                            <span>
                              <FiFlag />
                            </span>{" "}
                            Medium
                          </button>
                        </div>
                        <div
                          className={data.priority === "Low" ? "active" : ""}
                        >
                          <button
                            type="button"
                            onClick={() => handlePriorityChange("Low")}
                          >
                            <span>
                              <FiFlag />
                            </span>{" "}
                            Low
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <input type="submit" name="submit" value="Save" />
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <Toaster />
    </>
  );
}

export default MyProjectsTask;
