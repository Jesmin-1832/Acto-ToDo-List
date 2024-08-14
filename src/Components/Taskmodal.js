
import React, { useEffect, useState, useRef } from "react";
import "./css/modal.css";
import dayjs from "dayjs";
import { FaStar } from "react-icons/fa";
import { MdBusinessCenter, MdFamilyRestroom, MdWifiCalling3 } from "react-icons/md";
import { IoIosCloseCircle } from "react-icons/io";
import { RiMenuFold4Fill } from "react-icons/ri";
import Axios from "axios";
import { API_BASE_URL } from "./ApiMain";
import toast, { Toaster } from "react-hot-toast";

const Taskmodal = ({ show, onClose, refreshTasks, selectedDate, task }) => {
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState({
    datetime: dayjs().format("YYYY-MM-DDTHH:mm"),
    category: "Business",
    task: "",
    description: "",
    isFavorite: false,
  });
  const [error, setError] = useState(""); // Error state
  const [isUpdate, setIsUpdate] = useState(false);
  const taskInputRef = useRef(null);

  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem("userid"));
    setUser(userId ? userId : "");
  }, []);

  useEffect(() => {
    if (selectedDate) {
      setData((prevData) => ({
        ...prevData,
        datetime: dayjs(selectedDate).format("YYYY-MM-DDTHH:mm"),
      }));
    }
  }, [selectedDate]);

  useEffect(() => {
    if (task) {
      setData({
        datetime: dayjs(task.TaskDate).format("YYYY-MM-DDTHH:mm"),
        category: getCategoryFromId(task.GroupId),
        task: task.Task,
        description: task.TaskDescription || "",
        isFavorite: task.Taskfavourite === 1,
      });
      setIsUpdate(true);
    } else {
      setData({
        datetime: dayjs(selectedDate).format("YYYY-MM-DDTHH:mm"),
        category: "Business",
        task: "",
        description: "",
        isFavorite: false,
      });
      setIsUpdate(false);
    }
  }, [task, selectedDate]);

  useEffect(() => {
    if (show) {
      taskInputRef.current.focus();
    }
  }, [show]);

  const getCategoryFromId = (id) => {
    switch (id) {
      case 1:
        return "Business";
      case 2:
        return "Call";
      case 3:
        return "Family";
      case 4:
        return "Other";
      default:
        return "Business";
    }
  };

  const getIdFromCategory = (category) => {
    switch (category) {
      case "Business":
        return 1;
      case "Call":
        return 2;
      case "Family":
        return 3;
      case "Other":
        return 4;
      default:
        return 1;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
    setError(""); // Clear error message on input change
  };

  const handleDateTimeChange = (e) => {
    setData({
      ...data,
      datetime: e.target.value,
    });
  };

  const handleCategorySelect = (category) => {
    setData({ ...data, category });
  };

  const handleFavoriteToggle = () => {
    setData((prevData) => ({ ...prevData, isFavorite: !prevData.isFavorite }));
  };

  const validateTask = () => {
    if (!data.task.trim()) {
      setError("Task name is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateTask()) {
      return; // Prevent form submission if validation fails
    }

    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true);

    const categoryId = getIdFromCategory(data.category);

    const taskData = {
      LoginId: user,
      GroupId: categoryId,
      Task: data.task,
      TaskDate: data.datetime,
      Taskfavourite: data.isFavorite ? 1 : 0,
      TaskAddtime: "",
      Done: isUpdate ? task.Done : false,
      TaskDescription: data.description,
      TaskNotification: 0,
    };

    const url = isUpdate
      ? `${API_BASE_URL}/Task/Update`
      : `${API_BASE_URL}/Task`;

    if (isUpdate) {
      taskData.Taskid = task.Taskid;
    }

    Axios.post(url, taskData, {
      Accept: "application/json",
      "Content-Type": "application/json",
    })
      .then((res) => {
        taskInputRef.current.focus();
        refreshTasks();
        toast.success(
          isUpdate ? "Task Updated Successfully" : "Task Added Successfully"
        );

        if (!isUpdate) {
          setData({
            datetime: dayjs().format("YYYY-MM-DDTHH:mm"),
            category: "Business",
            task: "",
            description: "",
            isFavorite: false,
          });
        }

        if (isUpdate) {
          onClose();
        }
      })
      .catch((err) => {
        console.log(err);
        setError(isUpdate ? "Error updating task" : "Error adding task");
      })
      .finally(() => {
        setIsSubmitting(false); // Re-enable the submit button
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
                    {isUpdate ? "Edit Task" : "Add Task"}
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
                <div className="modal-body">
                  <h3>Categories</h3>
                  <div className="categories">
                    <div
                      className={`icon1 ${data.category === "Business" ? "active" : ""
                        }`}
                      onClick={() => handleCategorySelect("Business")}
                    >
                      <span>
                        <MdBusinessCenter />
                      </span>
                      <h4>Business</h4>
                    </div>
                    <div
                      className={`icon2 ${data.category === "Call" ? "active" : ""
                        }`}
                      onClick={() => handleCategorySelect("Call")}
                    >
                      <span>
                        <MdWifiCalling3 />
                      </span>
                      <h4>Call</h4>
                    </div>
                    <div
                      className={`icon3 ${data.category === "Family" ? "active" : ""
                        }`}
                      onClick={() => handleCategorySelect("Family")}
                    >
                      <span>
                        <MdFamilyRestroom />
                      </span>
                      <h4>Family</h4>
                    </div>
                    <div
                      className={`icon4 ${data.category === "Other" ? "active" : ""
                        }`}
                      onClick={() => handleCategorySelect("Other")}
                    >
                      <span>
                        <RiMenuFold4Fill />
                      </span>
                      <h4>Other</h4>
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{ position: "relative" }}>
                  <input
                    type="datetime-local"
                    value={data.datetime}
                    onChange={handleDateTimeChange}
                    name="datetime"
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
                  {error && <span className="apiErrorMessage addTaskError">{error}</span>}
                  <textarea
                    placeholder="Enter Description"
                    name="description"
                    value={data.description}
                    onChange={handleInputChange}
                    rows={4}
                  ></textarea>
                  <input
                    type="submit"
                    name="submit"
                    value={isUpdate ? "Update" : "Save"}
                    disabled={isSubmitting} // Disable the button while submitting
                  />
                </div>
              </form>
            </div>
          </div>
        )}
        <Toaster position="top-center" reverseOrder={false} />
      </div>
    </>
  );
};

export default Taskmodal;
