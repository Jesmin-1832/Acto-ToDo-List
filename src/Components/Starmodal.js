import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaStar } from "react-icons/fa";
import Axios from "axios";
import { useDate } from "./Date";
import { API_BASE_URL } from "./ApiMain";
import "./css/starmodal.css";
import { toast } from "react-hot-toast";

// Define category names and corresponding GroupId
const CATEGORY_NAMES = {
  1: "Business",
  2: "Call",
  3: "Family",
  4: "Other",
};

const CATEGORY_COLORS = {
  1: "#9c8bda",
  2: "#f7a905",
  3: "#44bce2",
  4: "#ff7676",
};

const Starmodal = ({ open, closeModal }) => {
  const [tasks, setTasks] = useState({});
  const [userid, setUserid] = useState(null);
  const { selectedDate } = useDate();
  const [animatingTaskId, setAnimatingTaskId] = useState(null);

  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem("userid"));
    setUserid(userId);
  }, []);

  useEffect(() => {
    if (userid && open) {
      fetchStarredTasks();
    }
  }, [userid, open]);

  const fetchStarredTasks = () => {
    const formattedDate = selectedDate.format("YYYY-MM-DD");
    Axios.get(
      `${API_BASE_URL}/Task?LoginId=${userid}&TaskDate=${formattedDate}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => {
        // Filter tasks to include only the defined categories
        const groupedTasks = res.data.GroupList.reduce((acc, group) => {
          if (CATEGORY_NAMES[group.GroupId]) {
            // Only include defined categories
            acc[group.GroupId] = group.Returngroups.filter(
              (task) => task.Taskfavourite === 1
            );
          }
          return acc;
        }, {});
        setTasks(groupedTasks);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error fetching tasks.");
      });
  };

  return (
    <div>
      <div className={`Starmodal ${open ? "show" : ""}`}>
        <div
          className={`modalContent sidebar-inner ${open ? "open" : "closed"}`}
        >
          <div className="modalhead d-flex align-items-center justify-content-between">
            <button className="closeButton" onClick={closeModal}>
              <FaChevronLeft />
            </button>
            <h3>Favourite Tasks</h3>
            <div></div>
          </div>

          <div className="projectTask-inner">
            <div className="projectTasks">

              <div className="taskCategories">
                {Object.keys(CATEGORY_NAMES).map((groupId) => {
                  const categoryTasks = tasks[groupId] || [];
                  return (
                    <div
                      key={groupId}
                      className="taskbox"
                      style={{
                        borderTop: `4px solid ${CATEGORY_COLORS[groupId]}`,
                      }}
                    >
                      <h3>{CATEGORY_NAMES[groupId]}</h3>
                      <div className="tasklistbox">
                        {categoryTasks.length > 0 ? (
                          categoryTasks.map((task) => (
                            <div
                              key={task.Taskid}
                              className={`tasklist-inner ${animatingTaskId === task.Taskid
                                ? "animate"
                                : ""
                                }`}
                            >
                              <div
                                className={`checkbox-container1 ${task.Priority}`}
                              >
                                <p>{task.Task}</p>
                              </div>
                              <FaStar
                                style={{
                                  color:
                                    task.Taskfavourite === 1
                                      ? "green"
                                      : "lightgray",
                                }}
                                className={`favoriteicon ${task.Taskfavourite === 1 ? "" : "disabled"
                                  }`}
                              />
                            </div>
                          ))
                        ) : (
                          <div className="nofavorite-outer">
                            <p className="nofavoritetask">
                              No Favourite Task
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Starmodal;