
import React, { useState, useEffect } from "react";
import { Calendar, Badge } from "rsuite";
import Axios from "axios";
import { API_BASE_URL } from "./ApiMain";
import "./css/calendar.min.css";
import "./css/calendar.css";
import dayjs from "dayjs";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";

// Function to format date manually
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Predefined dark colors
const darkColors = [
  "#EB3678",
  "#4F1787",
  "#F97300",
  "#005B41",
  "#CD1818",
  "#399918",
  "#32012F",
  "#0802A3",
  "#3F2305",
  "#016A70",
];

// Function to shuffle an array
const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

const CalendarComponent = ({ onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [userid, setUserid] = useState(null);
  const [highlightedDates, setHighlightedDates] = useState([]);
  const [isVisible, setIsVisible] = useState(true);

  // Handle date change and update local storage
  const handleDateChange = (date) => {
    const dayjsDate = dayjs(date); // Convert to dayjs object
    setSelectedDate(dayjsDate);
    const formattedDate = formatDate(date); // Use your formatDate function
    localStorage.setItem("selectedDate", formattedDate);
    onDateSelect(dayjsDate); // Notify parent about the date change
  };

  // Handle month change with buttons
  const changeMonth = (direction) => {
    const newDate =
      direction === "next"
        ? selectedDate.add(1, "month")
        : selectedDate.subtract(1, "month");
    setSelectedDate(newDate);
  };

  // Initialize selected date from local storage
  useEffect(() => {
    const storedDate = localStorage.getItem("selectedDate");
    const parsedDate = storedDate ? dayjs(storedDate) : dayjs();
    setSelectedDate(parsedDate);
    localStorage.setItem("selectedDate", parsedDate.format("YYYY-MM-DD"));
  }, []);

  // Fetch user ID from local storage
  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem("userid"));
    if (userId) {
      setUserid(userId);
    }
  }, []);

  // Fetch highlighted dates from API
  useEffect(() => {
    if (userid) {
      Axios.get(`${API_BASE_URL}/Task/TaskDotDate/${userid}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          const shuffledColors = shuffleArray([...darkColors]); // Shuffle colors
          const datesArray = res.data.Date.map((item, index) => ({
            date: item.TaskDate,
            color: shuffledColors[index % shuffledColors.length], // Assign shuffled colors cyclically
          }));
          const uniqueDates = Array.from(
            new Map(datesArray.map((d) => [d.date, d])).values()
          );
          setHighlightedDates(uniqueDates);
        })
        .catch((err) => {
          console.error("Error fetching tasks:", err);
        });
    }
  }, [userid]);

  // Toggle visibility and reshuffle colors
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    if (!isVisible) {
      const shuffledColors = shuffleArray([...darkColors]); // Shuffle colors again
      setHighlightedDates((prevDates) =>
        prevDates.map((d, index) => ({
          ...d,
          color: shuffledColors[index % shuffledColors.length],
        }))
      );
    }
  };

  // Render cell with badge if there are tasks for that date
  const renderCell = (date) => {
    const formattedDate = formatDate(date);
    const dateInfo = highlightedDates.find((d) => d.date === formattedDate);

    // Get today's date and format it
    const today = formatDate(dayjs().toDate());

    // Apply fixed color for today's date
    const color = dateInfo
      ? formattedDate === today
        ? "black"
        : dateInfo.color // Fixed color for today
      : null;

    if (color) {
      return (
        <Badge
          className="calendar-todo-item-badge"
          style={{ backgroundColor: color }}
        />
      );
    }

    return null;
  };

  return (
    <div className="calendar-main">
      {isVisible && (
        <div className="calendar-popup">
          <div className="calendar-controls">
            <button onClick={() => changeMonth("prev")}> <FaCaretLeft /> </button>
            <button onClick={() => changeMonth("next")}> <FaCaretRight /> </button>
          </div>
          <Calendar
            compact
            value={selectedDate.toDate()} // Convert dayjs to native Date for Calendar component
            onChange={handleDateChange}
            renderCell={renderCell}
          />
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;
