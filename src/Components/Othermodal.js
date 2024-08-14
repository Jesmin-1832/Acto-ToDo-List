import React, { useEffect, useState, useRef } from "react";
import "./css/modal.css";
import dayjs from "dayjs";
import { FaStar } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";
import Axios from "axios";
import { API_BASE_URL } from "./ApiMain";
import toast, { Toaster } from "react-hot-toast";

function Othermodal({ show, onClose, refreshTasks, selectedDate, task }) {
  const [user, setUser] = useState();
  const [data, setData] = useState({
    datetime: selectedDate
      ? selectedDate.format("YYYY-MM-DDTHH:mm")
      : dayjs().format("YYYY-MM-DDTHH:mm"),
    category: "Other",
    task: "",
    description: "",
    isFavorite: false,
  });
  const [error, setError] = useState(""); // Error state
  const taskInputRef = useRef(null);

  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem("userid"));
    setUser(userId ? userId : "");
  }, []);

  useEffect(() => {
    if (selectedDate) {
      setData((prevData) => ({
        ...prevData,
        datetime: selectedDate.format("YYYY-MM-DDTHH:mm"),
      }));
    }
  }, [selectedDate]);

  useEffect(() => {
    if (task) {
      setData({
        datetime: dayjs(task.TaskDate).format("YYYY-MM-DDTHH:mm"),
        category: "Other",
        task: task.Task,
        description: task.TaskDescription || "",
        isFavorite: task.Taskfavourite === 1,
      });
    } else {
      setData({
        datetime: dayjs(selectedDate).format("YYYY-MM-DDTHH:mm"),
        category: "Other",
        task: "",
        description: "",
        isFavorite: false,
      });
    }
  }, [task, selectedDate]);

  useEffect(() => {
    if (show) {
      taskInputRef.current.focus();
    }
  }, [show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
    if (error) {
      setError(""); // Clear error message on input change
    }
  };

  const handleFavoriteToggle = () => {
    setData((prevData) => ({ ...prevData, isFavorite: !prevData.isFavorite }));
  };

  const validateForm = () => {
    if (data.task.trim() === "") {
      setError("Task cannot be blank");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Prevent form submission if validation fails
    }

    const taskData = {
      LoginId: user,
      GroupId: 4, // GroupId for Other tasks
      Task: data.task,
      TaskDate: data.datetime,
      Taskfavourite: data.isFavorite ? 1 : 0,
      TaskAddtime: "",
      Done: task ? task.Done : false,
      TaskDescription: data.description, // Include description here
      TaskNotification: 0,
    };

    const url = task ? `${API_BASE_URL}/Task/Update` : `${API_BASE_URL}/Task`;

    if (task) {
      taskData.Taskid = task.Taskid;
    }

    Axios.post(url, taskData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then(() => {
        refreshTasks();
        toast.success(
          task ? "Task Updated Successfully" : "Task Added Successfully"
        );
        setData({
          datetime: dayjs().format("YYYY-MM-DDTHH:mm"),
          category: "Other",
          task: "",
          description: "",
          isFavorite: false,
        });
        onClose();
      })
      .catch((err) => {
        console.log(err);
        setError(task ? "Error updating task" : "Error adding task");
      });
  };

  return (
    <>
      <div className="addtaskmodal">
        {show && (
          <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="d-flex align-items-center modal-topbar">
                  <h2 className="modal-title">
                    {task ? "Edit Task" : "Other Task"}
                  </h2>
                  <FaStar
                    className={`addfavourite ${data.isFavorite ? "favoriteicon" : ""
                      }`}
                    style={{
                      color: data.isFavorite ? "green" : "lightgray",
                    }}
                    onClick={handleFavoriteToggle}
                  />
                </div>
                <IoIosCloseCircle onClick={onClose} className="close-button" />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-footer">
                  <input
                    type="datetime-local"
                    name="datetime"
                    value={data.datetime}
                    onChange={handleInputChange}
                  />
                  <textarea
                    placeholder="Enter Task Name"
                    name="task"
                    autoFocus
                    value={data.task}
                    onChange={handleInputChange}
                    ref={taskInputRef}
                    rows={1}
                    className={error ? "input-error2" : ""}
                  ></textarea>
                  <textarea
                    placeholder="Enter Task Description"
                    name="description"
                    value={data.description}
                    onChange={handleInputChange}
                    rows={4}
                  ></textarea>
                  {error && <span className="apiErrorMessage addTaskErrorSidebar">{error}</span>}
                  <input
                    type="submit"
                    name="submit"
                    value={task ? "Update" : "Save"}
                  />
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Toaster />
    </>
  );
}

export default Othermodal;
