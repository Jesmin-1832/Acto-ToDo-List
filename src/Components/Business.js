
import React, { useState, useEffect } from "react";
import { FaPlus, FaStar } from "react-icons/fa";
import Axios from "axios";
import Tooltip from "@mui/material/Tooltip"; // Import Tooltip from MUI
import { useDate } from "./Date";
import { useTasks } from "./Taskcontaxt";
import dayjs from "dayjs";
import { API_BASE_URL } from "./ApiMain";
import "./css/businessTask.css";
import Businessmodal from "./Businessmodal";

function Business() {
  const [user, setUser] = useState(null);
  const [checkedTasks, setCheckedTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [starClicked, setStarClicked] = useState(new Set());
  const { tasks, setTasks } = useTasks();
  const { selectedDate } = useDate();
  const [animatingTaskId, setAnimatingTaskId] = useState(null);
  const [animateBusinessList, setAnimateBusinessList] = useState(false);

  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem("userid"));
    setUser(userId);
    if (userId) {
      getdata(selectedDate, userId);
    }
  }, [selectedDate]);

  const getdata = (date, userId) => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    Axios.get(
      `${API_BASE_URL}/Task?LoginId=${userId}&TaskDate=${formattedDate}&GroupId=1`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => {
        setTasks(res.data.GroupList);
        const doneTasks = res.data.GroupList.flatMap((group) =>
          group.Returngroups.filter((task) => task.Done === 1).map(
            (task) => task.Taskid
          )
        );
        setCheckedTasks(doneTasks);
      })
      .catch((err) => {
        console.log(err);
        setTasks([]);
      });
  };

  const updateTaskStatus = (task) => {
    const updatedTask = { ...task, Done: task.Done === 1 ? 0 : 1 };

    Axios.post(
      `${API_BASE_URL}/Task/Update`,
      {
        LoginId: user,
        GroupId: 1,
        Taskid: task.Taskid,
        Task: task.Task,
        TaskDate: dayjs(selectedDate).format("YYYY-MM-DD"),
        Taskfavourite: 0,
        TaskAddtime: "",
        Done: updatedTask.Done,
        TaskDescription: "string",
        TaskNotification: 0,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => {
        const updatedTasks = tasks.map((group) => ({
          ...group,
          Returngroups: group.Returngroups.map((t) =>
            t.Taskid === task.Taskid ? updatedTask : t
          ),
        }));

        setTasks(updatedTasks);

        setCheckedTasks((prevCheckedTasks) => {
          if (updatedTask.Done === 1) {
            return [...prevCheckedTasks, task.Taskid];
          } else {
            return prevCheckedTasks.filter((id) => id !== task.Taskid);
          }
        });

        setAnimatingTaskId(task.Taskid);
        setAnimateBusinessList(true);
        setTimeout(() => {
          setAnimatingTaskId(null);
          setAnimateBusinessList(false);
        }, 1000);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const toggleTaskFavourite = (task) => {
    const updatedTask = {
      ...task,
      Taskfavourite: task.Taskfavourite === 1 ? 0 : 1,
    };

    Axios.post(
      `${API_BASE_URL}/Task/Update`,
      {
        LoginId: user,
        GroupId: 1,
        Taskid: task.Taskid,
        Task: task.Task,
        TaskDate: dayjs(selectedDate).format("YYYY-MM-DD"),
        Taskfavourite: updatedTask.Taskfavourite,
        TaskAddtime: "",
        Done: task.Done,
        TaskDescription: "string",
        TaskNotification: 0,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => {
        const updatedTasks = tasks.map((group) => ({
          ...group,
          Returngroups: group.Returngroups.map((t) =>
            t.Taskid === task.Taskid ? updatedTask : t
          ),
        }));

        setTasks(updatedTasks);
        setStarClicked((prev) => new Set(prev).add(task.Taskid));

        setAnimatingTaskId(task.Taskid);
        setAnimateBusinessList(true);
        setTimeout(() => {
          setAnimatingTaskId(null);
          setAnimateBusinessList(false);
        }, 1000);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const closeModal = () => {
    setSelectedTask(null);
    setShowModal(false);
  };

  const filterTasks = (groupId) => {
    const group = tasks.find((group) => group.GroupId === groupId);
    if (!group) return [];

    const doneFavorites = [];
    const favoriteTasks = [];
    const doneTasks = [];
    const otherTasks = [];

    group.Returngroups.forEach((task) => {
      if (task.Taskfavourite === 1) {
        favoriteTasks.push(task);
      } else if (task.Done === 1 && task.Taskfavourite === 1) {
        doneFavorites.push(task);
      } else if (task.Done === 1) {
        doneTasks.push(task);
      } else {
        otherTasks.push(task);
      }
    });

    return [...favoriteTasks, ...doneFavorites, ...otherTasks, ...doneTasks];
  };

  const toggleTaskChecked = (task) => {
    updateTaskStatus(task);
  };

  const countTasks = (groupId) => {
    const group = tasks.find((group) => group.GroupId === groupId);
    return group ? group.Returngroups.length : 0;
  };

  const businessTasks = filterTasks(1);
  const displayDate =
    businessTasks.length > 0 ? businessTasks[0].TaskDate : selectedDate;

  return (
    <div className="businessTask">
      <div className="container">
        <div className="businessTaskBox">
          <div className="d-flex align-items-center justify-content-between">
            <h3>Business</h3>
            <h5>{dayjs(displayDate).format("MMMM D, YYYY")}</h5>
            <h6>{countTasks(1)}</h6>
          </div>
          <div
            className={animateBusinessList ? "listAnimate" : ""}
            style={{
              marginTop: "20px",
              maxHeight: "350px",
              overflow: "scroll",
            }}
          >
            {businessTasks.map((task) => (
              <div
                key={task.Taskid}
                className={`tasklist animate__animated ${animatingTaskId === task.Taskid ? "animate__fadeInUp" : ""
                  } ${checkedTasks.includes(task.Taskid) ? "checked" : ""}`}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <label className="business-checkbox">
                      <input
                        type="checkbox"
                        checked={checkedTasks.includes(task.Taskid)}
                        onChange={() => toggleTaskChecked(task)}
                      />
                      <span></span>
                    </label>
                    <Tooltip title={task.TaskDescription} followCursor placement="right">
                      <p onClick={() => handleTaskClick(task)}>{task.Task}</p>
                    </Tooltip>
                  </div>
                  <div>
                    <FaStar
                      className={`favoriteicon ${animatingTaskId === task.Taskid
                        ? "animate__fadeInUp"
                        : ""
                        } ${checkedTasks.includes(task.Taskid) &&
                          !starClicked.has(task.Taskid)
                          ? "disabled"
                          : ""
                        }`}
                      style={{
                        color:
                          task.Taskfavourite === 1
                            ? "green"
                            : task.Done === 1
                              ? "lightgray"
                              : "lightgray",
                      }}
                      onClick={() => {
                        toggleTaskFavourite(task);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="micro" onClick={() => toggleModal()}>
        <FaPlus />
      </div>
      {showModal && (
        <Businessmodal
          show={showModal}
          onClose={closeModal}
          refreshTasks={() => getdata(selectedDate, user)}
          selectedDate={selectedDate}
          task={selectedTask}
        />
      )}
    </div>
  );
}

export default Business;
