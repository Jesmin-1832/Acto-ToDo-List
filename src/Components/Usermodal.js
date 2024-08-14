
import React, { useState, useEffect } from "react";
import "./css/usermodal.css";
import { FaChevronLeft } from "react-icons/fa";
import CanvasJSReact from "@canvasjs/react-charts";
import dayjs from "dayjs";
import Axios from "axios";
import { useDate } from "./Date";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useTasks } from "./Taskcontaxt";
import isoWeek from "dayjs/plugin/isoWeek";
import { API_BASE_URL } from "./ApiMain";

dayjs.extend(isoWeek);

const { CanvasJSChart } = CanvasJSReact;

const UserModal = ({ showModal, closeModal }) => {
  const [tasks, setTasks] = useState([]);
  const [userid, setUserid] = useState(null);
  const { selectedDate } = useDate();
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [weekData, setWeekData] = useState([]);
  const { refreshTasks } = useTasks();
  const [barData, setBarData] = useState([]);
  const [currentWeekCount, setCurrentWeekCount] = useState(0);
  const [dataPointWidth, setDataPointWidth] = useState(45);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 375) {
        setDataPointWidth(30);
      } else if (window.innerWidth <= 425) {
        setDataPointWidth(35);
      } else if (window.innerWidth <= 750) {
        setDataPointWidth(40);
      }
      else {
        setDataPointWidth(50);
      }
    };
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (showModal) {
      const userId = JSON.parse(localStorage.getItem("userid"));
      setUserid(userId || null);
    }
  }, [showModal]);

  useEffect(() => {
    if (userid && showModal) {
      getData();
    }
  }, [userid, selectedDate, showModal]);

  const getData = () => {
    if (userid) {
      Axios.post(`${API_BASE_URL}/WeekGraph/PieChart`, {
        LoginId: userid,
        TaskDate: selectedDate,
      })
        .then((res) => {
          setTasks(res.data.pieData || []);
        })
        .catch((err) => {
          console.error(err);
          setTasks([]);
        });

      Axios.post(`${API_BASE_URL}/WeekGraph/WeekGraphCount`, {
        LoginId: userid,
        TaskDate: selectedDate,
      })
        .then((res) => {
          setBarData(res.data.barData || []);
        })
        .catch((err) => {
          console.error(err);
        });

      // Fetch current week task count
      const { start, end } = getCurrentWeek();
      Axios.post(`${API_BASE_URL}/WeekGraph/CurrentWeekTaskCount`, {
        LoginId: userid,
        StartDate: start,
        EndDate: end,
      })
        .then((res) => {
          setCurrentWeekCount(res.data.count || 0);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  useEffect(() => {
    if (showModal) {
      const weeks = getWeeksOfMonth(currentMonth);
      setWeekData(weeks);
    }
  }, [currentMonth, showModal]);

  const getWeeksOfMonth = (date) => {
    const startOfMonth = date.startOf("month");
    const endOfMonth = date.endOf("month");
    const weeks = [];
    let currentWeek = startOfMonth.startOf("week");

    while (currentWeek.isBefore(endOfMonth, "week")) {
      weeks.push({
        week: `Week ${currentWeek.isoWeek() - startOfMonth.isoWeek() + 1}`,
        start: currentWeek.startOf("week"),
        end: currentWeek.endOf("week"),
      });
      currentWeek = currentWeek.add(1, "week");
    }

    return weeks;
  };

  const getCurrentWeek = () => {
    const now = dayjs();
    const startOfWeek = now.startOf("week");
    const endOfWeek = now.endOf("week");

    return {
      start: startOfWeek.format("YYYY-MM-DD"),
      end: endOfWeek.format("YYYY-MM-DD"),
      label: `Current Week ${now.isoWeek()}`,
    };
  };

  const getBarData = () => {
    // Transform barData to match the required format for CanvasJSChart
    const dataPoints = barData.map((week, index) => ({
      label: `W${index + 1}`, // Assign 'w1', 'w2', 'w3', etc. as labels
      y: week.value,
      color: "#4caf50", // Example color; you can set it dynamically if needed
    }));

    return [
      {
        type: "column",
        dataPoints,
      },
    ];
  };

  const calculateCategoryProgress = () => {
    const categories = ["Business", "Call", "Family", "Other"];
    return categories.map((category) => {
      const task = tasks.find((t) => t.GroupNickName === category);
      return {
        category,
        progress: task ? task.value : 0,
        color:
          category === "Business"
            ? "#9c8bda"
            : category === "Call"
              ? "#f7a905"
              : category === "Family"
                ? "#44bce2"
                : "#ff7676",
      };
    });
  };

  const categoryProgress = calculateCategoryProgress();

  const barOptions = {
    data: getBarData(),
    dataPointWidth: dataPointWidth,
  };

  return (
    <div>
      <div className={`userModal ${showModal ? "show" : ""}`}>
        <div className="modalContent">
          <div className="modalhead d-flex align-items-center justify-content-between">
            <button className="closeButton" onClick={closeModal}>
              <FaChevronLeft />
            </button>
            <h3>Weekly Report</h3>
            <div></div>
          </div>

          <div className="charts d-flex text-center">
            <div className="w-50 lg-w-100">
              <div className="barsChart">
                <h2>Weekly Task Overview</h2>
                <div className="chart-inner" style={{ width: "100%" }}>
                  <CanvasJSChart options={barOptions} className="chartBarLine" />
                </div>
              </div>
            </div>
            <div className="w-50 lg-w-100">
              <div className="pieChart">
                <h2>Completed Task From Main Category</h2>
                <div className="chart-inner">
                  <div className="d-flex align-items-center justify-content-evenly">
                    {categoryProgress.map(
                      ({ category, progress, color }, index) => (
                        <div
                          className="pieCircle"
                          key={index}
                        >
                          <p>{category}</p>
                          <CircularProgressbar
                            value={progress}
                            text={`${Math.round(progress)}%`}
                            styles={buildStyles({
                              pathColor: color,
                              textSize: 12,
                              textColor: color,
                              trailColor: "#efefef",
                            })}
                          />
                          <span>Done</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
