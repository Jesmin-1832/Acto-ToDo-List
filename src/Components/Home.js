import React, { useEffect, useState } from "react";
import { FaPlus, FaStar } from "react-icons/fa";
import Taskmodal from "./Taskmodal";
import Axios from "axios";
import { useDate } from "./Date";
import { useNavigate, useLocation } from "react-router-dom";
import { useTasks } from "./Taskcontaxt";
import "./css/home.css";
import { API_BASE_URL } from "./ApiMain";
import toast, { Toaster } from "react-hot-toast";
import dayjs from "dayjs";
import { Tooltip } from "@mui/material";

function Home() {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const { tasks, setTasks } = useTasks();
  const { selectedDate } = useDate();
  const [checkedTasks, setCheckedTasks] = useState([]);
  const [favoriteTasks, setFavoriteTasks] = useState([]);
  const [animatingTaskId, setAnimatingTaskId] = useState(null);
  const [starClicked, setStarClicked] = useState(new Set());
  const [animateBusinessList, setAnimateBusinessList] = useState(false);
  const [animateCallList, setAnimateCallList] = useState(false);
  const [animateFamilyList, setAnimFamilyList] = useState(false);
  const [animateOtherList, setAnimOtherList] = useState(false);
  const [isDateEmpty, setIsDateEmpty] = useState(false); // State to check if the date has no tasks
  const [isPastDate, setIsPastDate] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem("userid"));
    if (userId) {
      setUser(userId);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (user) {
      const isPast = dayjs(selectedDate).isBefore(dayjs(), "day");
      setIsPastDate(isPast);
      refreshTasks();
    }
  }, [selectedDate, user]);

  useEffect(() => {
    if (location.pathname !== "/home") {
      navigate("/home");
    }
  }, [location.pathname, navigate]);

  const toggleModal = () => setShowModal(!showModal);

  const getdata = (date, userId) => {
    const formattedDate = date.format("YYYY-MM-DD");
    Axios.get(
      `${API_BASE_URL}/Task?LoginId=${userId}&TaskDate=${formattedDate}`,
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
        const favoriteTasks = res.data.GroupList.flatMap((group) =>
          group.Returngroups.filter((task) => task.Taskfavourite === 1).map(
            (task) => task.Taskid
          )
        );
        setCheckedTasks(doneTasks);
        setFavoriteTasks(favoriteTasks);
        setStarClicked(new Set());

        const hasTasks = res.data.GroupList.some(
          (group) => group.Returngroups.length > 0
        );
        setIsDateEmpty(!hasTasks);
      })
      .catch((err) => {
        console.log(err);
        setTasks([]);
        setIsDateEmpty(true);
      });
  };

  const refreshTasks = () => {
    if (user) {
      getdata(selectedDate, user);
    }
  };

  const updateTaskStatus = (task, groupId) => {
    const updatedTask = { ...task, Done: task.Done === 1 ? 0 : 1 };

    Axios.post(
      `${API_BASE_URL}/Task/Update`,
      {
        LoginId: user,
        GroupId: groupId,
        Taskid: task.Taskid,
        Task: task.Task,
        TaskDate: selectedDate.format("YYYY-MM-DD"),
        Taskfavourite: task.Taskfavourite,
        TaskAddtime: task.TaskAddtime,
        Done: updatedTask.Done,
        TaskDescription: task.TaskDescription,
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

        const animationMap = {
          1: setAnimateBusinessList,
          2: setAnimateCallList,
          3: setAnimFamilyList,
          4: setAnimOtherList,
        };

        const setAnimation = animationMap[groupId];
        if (setAnimation) {
          setAnimatingTaskId(task.Taskid);
          setAnimation(true);
          setTimeout(() => {
            setAnimatingTaskId(null);
            setAnimation(false);
          }, 1000);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error updating task status");
      });
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTask(null);
  };

  const toggleTaskFavourite = (task, groupId) => {
    const updatedTask = {
      ...task,
      Taskfavourite: task.Taskfavourite === 1 ? 0 : 1,
    };

    Axios.post(
      `${API_BASE_URL}/Task/Update`,
      {
        LoginId: user,
        GroupId: groupId,
        Taskid: task.Taskid,
        Task: task.Task,
        TaskDate: selectedDate.format("YYYY-MM-DD"),
        Taskfavourite: updatedTask.Taskfavourite,
        TaskAddtime: task.TaskAddtime,
        Done: task.Done,
        TaskDescription: task.TaskDescription,
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
        refreshTasks();
        const updatedTasks = tasks.map((group) => ({
          ...group,
          Returngroups: group.Returngroups.map((t) =>
            t.Taskid === task.Taskid ? updatedTask : t
          ),
        }));

        setTasks(updatedTasks);
        setFavoriteTasks((prevFavoriteTasks) => {
          if (updatedTask.Taskfavourite === 1) {
            return [...prevFavoriteTasks, task.Taskid];
          } else {
            return prevFavoriteTasks.filter((id) => id !== task.Taskid);
          }
        });

        setStarClicked((prev) => new Set(prev).add(task.Taskid));

        // Trigger animation based on groupId
        const animationMap = {
          1: setAnimateBusinessList,
          2: setAnimateCallList,
          3: setAnimFamilyList,
          4: setAnimOtherList,
        };

        const setAnimation = animationMap[groupId];
        if (setAnimation) {
          setAnimatingTaskId(task.Taskid);
          setAnimation(true);
          setTimeout(() => {
            setAnimatingTaskId(null);
            setAnimation(false);
          }, 1000);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error updating task favourite status");
      });
  };

  const toggleTaskChecked = (task, groupId) => {
    updateTaskStatus(task, groupId);
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

  const editShowPopup = (task, groupId) => {
    const updatedTask = { ...task, GroupId: groupId };
    setSelectedTask(updatedTask);
    setShowModal(true);
  };

  return (
    <div className="hometasks">
      <div className="container">
        <div
          className="d-flex justify-content-around maintasks"
          style={{
            visibility: isDateEmpty ? "visible" : "visible",
            display: isDateEmpty && isPastDate ? "none" : "flex",
          }}
        >
          <div className="w-25 lg-w-50 md-w-100">
            <div className="taskbox businessType">
              <div className="d-flex align-items-center justify-content-between">
                <h3>Business</h3>
                <h6>{filterTasks(1).length}</h6>
              </div>
              <ul className={animateBusinessList ? "listAnimate" : ""}>
                {filterTasks(1).map((task) => (
                  <li
                    key={task.Taskid}
                    className={`animate__animated ${animatingTaskId === task.Taskid ? "animate__fadeInUp" : ""
                      } ${checkedTasks.includes(task.Taskid) ? "checked" : ""}`}
                  >
                    <div className="d-flex align-items-center">
                      <label className="lns-checkbox">
                        <input
                          type="checkbox"
                          checked={checkedTasks.includes(task.Taskid)}
                          onChange={() => toggleTaskChecked(task, 1)}
                        />
                        <span></span>
                      </label>
                      <Tooltip title={task.TaskDescription} followCursor placement="right">
                        <p onClick={() => editShowPopup(task, 1)}>{task.Task}</p>
                      </Tooltip>
                    </div>
                    <FaStar
                      className={`favoriteicon ${favoriteTasks.includes(task.Taskid) ? "favourite" : ""
                        } ${checkedTasks.includes(task.Taskid) ? "disabled" : ""
                        }`}
                      style={{
                        color: task.Taskfavourite === 1 ? "green" : "lightgray",
                      }}
                      onClick={() => toggleTaskFavourite(task, 1)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="w-25 lg-w-50 md-w-100">
            <div className="taskbox callType">
              <div className="d-flex align-items-center justify-content-between">
                <h3>Call</h3>
                <h6>{filterTasks(2).length}</h6>
              </div>
              <ul className={animateCallList ? "listAnimate" : ""}>
                {filterTasks(2).map((task) => (
                  <li
                    key={task.Taskid}
                    className={`animate__animated ${animatingTaskId === task.Taskid ? "animate__fadeInUp" : ""
                      } ${checkedTasks.includes(task.Taskid) ? "checked" : ""}`}
                  >
                    <div className="d-flex align-items-center">
                      <label className="lns-checkbox">
                        <input
                          type="checkbox"
                          checked={checkedTasks.includes(task.Taskid)}
                          onChange={() => toggleTaskChecked(task, 2)}
                        />
                        <span></span>
                      </label>
                      <Tooltip title={task.TaskDescription} followCursor placement="right">
                        <p onClick={() => editShowPopup(task, 2)}>{task.Task}</p>
                      </Tooltip>
                    </div>
                    <FaStar
                      className={`favoriteicon ${favoriteTasks.includes(task.Taskid) ? "favourite" : ""
                        } ${checkedTasks.includes(task.Taskid) ? "disabled" : ""
                        }`}
                      style={{
                        color: task.Taskfavourite === 1 ? "green" : "lightgray",
                      }}
                      onClick={() => toggleTaskFavourite(task, 2)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="w-25 lg-w-50 md-w-100">
            <div className="taskbox familyType">
              <div className="d-flex align-items-center justify-content-between">
                <h3>Family</h3>
                <h6>{filterTasks(3).length}</h6>
              </div>
              <ul className={animateFamilyList ? "listAnimate" : ""}>
                {filterTasks(3).map((task) => (
                  <li
                    key={task.Taskid}
                    className={`animate__animated ${animatingTaskId === task.Taskid ? "animate__fadeInUp" : ""
                      } ${checkedTasks.includes(task.Taskid) ? "checked" : ""}`}
                  >
                    <div className="d-flex align-items-center">
                      <label className="lns-checkbox">
                        <input
                          type="checkbox"
                          checked={checkedTasks.includes(task.Taskid)}
                          onChange={() => toggleTaskChecked(task, 3)}
                        />
                        <span></span>
                      </label>
                      <Tooltip title={task.TaskDescription} followCursor placement="right">
                        <p onClick={() => editShowPopup(task, 3)}>{task.Task}</p>
                      </Tooltip>
                    </div>
                    <FaStar
                      className={`favoriteicon ${favoriteTasks.includes(task.Taskid) ? "favourite" : ""
                        } ${checkedTasks.includes(task.Taskid) ? "disabled" : ""
                        }`}
                      style={{
                        color: task.Taskfavourite === 1 ? "green" : "lightgray",
                      }}
                      onClick={() => toggleTaskFavourite(task, 3)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="w-25 lg-w-50 md-w-100">
            <div className="taskbox otherType">
              <div className="d-flex align-items-center justify-content-between">
                <h3>Other</h3>
                <h6>{filterTasks(4).length}</h6>
              </div>
              <ul className={animateOtherList ? "listAnimate" : ""}>
                {filterTasks(4).map((task) => (
                  <li
                    key={task.Taskid}
                    className={`animate__animated ${animatingTaskId === task.Taskid ? "animate__fadeInUp" : ""
                      } ${checkedTasks.includes(task.Taskid) ? "checked" : ""}`}
                  >
                    <div className="d-flex align-items-center">
                      <label className="lns-checkbox">
                        <input
                          type="checkbox"
                          checked={checkedTasks.includes(task.Taskid)}
                          onChange={() => toggleTaskChecked(task, 4)}
                        />
                        <span></span>
                      </label>
                      <Tooltip title={task.TaskDescription} followCursor placement="right">
                        <p onClick={() => editShowPopup(task, 4)}>{task.Task}</p>
                      </Tooltip>
                    </div>
                    <FaStar
                      className={`favoriteicon ${favoriteTasks.includes(task.Taskid) ? "favourite" : ""
                        } ${checkedTasks.includes(task.Taskid) ? "disabled" : ""
                        }`}
                      style={{
                        color: task.Taskfavourite === 1 ? "green" : "lightgray",
                      }}
                      onClick={() => toggleTaskFavourite(task, 4)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`micro ${isPastDate ? "hidden" : ""}`}
        onClick={toggleModal}
      >
        <FaPlus />
      </div>

      {isDateEmpty && isPastDate && (
        <div className="empty-date-image">
          <img
            src="https://cdn.dribbble.com/users/4241563/screenshots/11874468/media/7796309c77cf752615a3f9062e6a3b3d.gif"
            alt="No tasks found"
            width={500}
          />
        </div>
      )}

      {showModal && (
        <Taskmodal
          show={showModal}
          onClose={closeModal}
          refreshTasks={refreshTasks}
          task={selectedTask}
          selectedDate={selectedDate}
        />
      )}
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

export default Home;
