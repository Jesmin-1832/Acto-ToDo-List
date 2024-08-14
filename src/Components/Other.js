import React, { useState, useEffect } from "react";
import { FaPlus, FaStar } from "react-icons/fa";
import Axios from "axios";
import { useDate } from "./Date";
import { useTasks } from "./Taskcontaxt";
import dayjs from "dayjs";
import { API_BASE_URL } from "./ApiMain";
import "./css/otherTask.css";
import Othermodal from "./Othermodal";
import { Tooltip } from "@mui/material";

function Other() {
  const [user, setUser] = useState(null);
  const [checkedTasks, setCheckedTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [starClicked, setStarClicked] = useState(new Set());
  const { tasks, setTasks } = useTasks();
  const { selectedDate } = useDate();
  const [modalOpen, setModalOpen] = useState(false);
  const [animatingTaskId, setAnimatingTaskId] = useState(null);
  const [animateOtherList, setAnimateOtherList] = useState(false);

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
      `${API_BASE_URL}/Task?LoginId=${userId}&TaskDate=${formattedDate}&GroupId=4`,
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
        GroupId: 4, // GroupId for Other
        Taskid: task.Taskid,
        Task: task.Task,
        TaskDate: dayjs(selectedDate).format("YYYY-MM-DD"),
        Taskfavourite: task.Taskfavourite,
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
        setAnimateOtherList(true);
        setTimeout(() => {
          setAnimatingTaskId(null);
          setAnimateOtherList(false);
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
        GroupId: 4, // GroupId for Other
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
        setAnimateOtherList(true);
        setTimeout(() => {
          setAnimatingTaskId(null);
          setAnimateOtherList(false);
        }, 1000);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const toggleTaskChecked = (task) => {
    updateTaskStatus(task);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
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

  const countTasks = (groupId) => {
    const group = tasks.find((group) => group.GroupId === groupId);
    return group ? group.Returngroups.length : 0;
  };

  const otherTasks = filterTasks(4); // GroupId for Other
  const displayDate =
    otherTasks.length > 0 ? otherTasks[0].TaskDate : selectedDate;

  const toggleModal = () => {
    setSelectedTask(null);
    setModalOpen(!modalOpen);
  };

  return (
    <div className="otherTask">
      <div className="container">
        <div className="otherTaskBox">
          <div className="d-flex align-items-center justify-content-between">
            <h3>Other</h3>
            <h5>{dayjs(displayDate).format("MMMM D, YYYY")}</h5>
            <h6>{countTasks(4)}</h6>
          </div>
          <div
            className={animateOtherList ? "listAnimate" : ""}
            style={{
              marginTop: "20px",
              maxHeight: "350px",
              overflow: "scroll",
            }}
          >
            {otherTasks.map((task) => (
              <div
                key={task.Taskid}
                className={`tasklist animate__animated ${animatingTaskId === task.Taskid ? "animate__fadeInUp" : ""
                  } ${checkedTasks.includes(task.Taskid) ? "checked" : ""}`}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <label className="other-checkbox">
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
                      onClick={() => toggleTaskFavourite(task)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="micro" onClick={() => setModalOpen(true)}>
        <FaPlus />
      </div>

      {modalOpen && (
        <Othermodal
          show={modalOpen}
          onClose={toggleModal}
          refreshTasks={() => getdata(selectedDate, user)}
          taskType="Other"
          selectedDate={selectedDate}
          task={selectedTask}
        />
      )}
    </div>
  );
}

export default Other;
