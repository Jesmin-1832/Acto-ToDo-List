
import React, { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { useDate } from "./Date";
import { useTasks } from "./Taskcontaxt";
import ProgressBar from "react-bootstrap/ProgressBar";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { BsCalendar2Date } from "react-icons/bs";
import { IoRepeat } from "react-icons/io5";
import { MdEditCalendar } from "react-icons/md";
import {
  FaSquareCaretLeft,
  FaSquareCaretRight,
  FaStar,
  FaDownload,
} from "react-icons/fa6";
import "./css/header.css";
import Calendar from "./Calendar";
import Axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Starmodal from "./Starmodal";
import { API_BASE_URL } from "./ApiMain";
import generateTaskPdfContent from "./generateTaskPdfContent";
import { useNavigate } from "react-router-dom";

function Header() {
  const [showCalendar, setShowCalendar] = useState(false);
  const { selectedDate, setSelectedDate } = useDate();
  const { tasks } = useTasks();
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState({});
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showStared, setShowStared] = useState(false);
  const [openFullWidthPopup, setOpenFullWidthPopup] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const reportTemplateRef = useRef(null);
  const [taskspdf, Settaskpdf] = useState([]);
  let navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userid"));
    const userInfoData = JSON.parse(localStorage.getItem("userinfo"));
    setUser(userData || null);
    setUserInfo(userInfoData || {});

    if (!userData) {
      navigate("/logout");
    } else {
      const storedDate = localStorage.getItem("selectedDate");
      if (!storedDate) {
        const today = dayjs();
        localStorage.setItem("selectedDate", today.format("YYYY-MM-DD"));
        setSelectedDate(today);
      }
    }
  }, [navigate, setSelectedDate]);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedDate = localStorage.getItem("selectedDate");
      if (storedDate) {
        const parsedDate = dayjs(storedDate);
        if (parsedDate.isValid()) {
          setSelectedDate(parsedDate);
        }
      }
    };

    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [setSelectedDate]);

  useEffect(() => {
    const handleUserProfileUpdated = () => {
      const updatedUserInfo = JSON.parse(localStorage.getItem("userinfo"));
      setUserInfo(updatedUserInfo ? updatedUserInfo : {});
    };

    window.addEventListener("userProfileUpdated", handleUserProfileUpdated);

    return () => {
      window.removeEventListener(
        "userProfileUpdated",
        handleUserProfileUpdated
      );
    };
  }, []);

  useEffect(() => {
    const taskCount = tasks.reduce(
      (count, group) => count + group.Returngroups.length,
      0
    );

    const doneTasksCount = tasks.reduce(
      (count, group) =>
        count + group.Returngroups.filter((task) => task.Done === 1).length,
      0
    );

    const totalTasksCount = taskCount;

    const newProgress =
      totalTasksCount > 0 ? (doneTasksCount / totalTasksCount) * 100 : 0;
    setProgress(newProgress);
  }, [tasks]);

  const handleCalendarClick = () => {
    setShowCalendar(!showCalendar);
  };

  const handleDateSelect = (newDate) => {
    setSelectedDate(newDate);
    localStorage.setItem("selectedDate", newDate.format("YYYY-MM-DD"));
    setShowCalendar(false);
  };

  const handleResetDate = () => {
    const today = dayjs();
    setSelectedDate(today);
    localStorage.setItem("selectedDate", today.format("YYYY-MM-DD"));
  };

  const handlePrevDate = () => {
    const prevDate = selectedDate.subtract(1, "day");
    setSelectedDate(prevDate);
    localStorage.setItem("selectedDate", prevDate.format("YYYY-MM-DD"));
  };

  const handleNextDate = () => {
    const nextDate = selectedDate.add(1, "day");
    setSelectedDate(nextDate);
    localStorage.setItem("selectedDate", nextDate.format("YYYY-MM-DD"));
  };

  const handleEndOfDay = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEndOfDayConfirmation = () => {
    const formattedDate = selectedDate.format("YYYY-MM-DD");
    const nextDate = selectedDate.add(1, "day").format("YYYY-MM-DD");

    Axios.get(
      `${API_BASE_URL}/EndOfTheDay?LoginId=${user}&TaskDate=${formattedDate}`
    )
      .then(() => {
        toast.success("Tasks transferred to the next day!");
        setSelectedDate(dayjs(nextDate));
        localStorage.setItem("selectedDate", nextDate);
        setOpen(false);
      })
      .catch((err) => {
        console.error("Error transferring tasks:", err);
      });

    setOpen(false);
  };

  const editShowStared = () => {
    setShowStared(true);
    setOpenFullWidthPopup(true);
  };

  const handleCloseFullWidthPopup = () => {
    setOpenFullWidthPopup(false);
  };

  const handleDownloadPdf = () => {
    const taskCountOnSelectedDate = tasks.reduce(
      (count, group) => count + group.Returngroups.length,
      0
    );

    if (taskCountOnSelectedDate === 0) {
      toast.error("Please add tasks and download the PDF.");
      return;
    }

    const formattedDate = dayjs(selectedDate).format("YYYY-MM-DDTHH:mm");

    Axios.post(`${API_BASE_URL}/GroupTaskPDF`, {
      LoginId: user,
      TaskDate: formattedDate,
    })
      .then((res) => {
        let data = res.data;
        Settaskpdf(data);

        generateTaskPdfContent(user, dayjs(selectedDate), data, (pdfBlob) => {
          toast.success("Task PDF downloaded successfully.");
          if (pdfBlob) {
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "TaskReport.pdf";
            link.click();
            URL.revokeObjectURL(url);
          } else {
            toast.error("Failed to generate PDF.");
          }
        });
      })
      .catch((err) => {
        console.error("API Error:", err.response || err); // Log detailed error
        Settaskpdf([]);
        toast.error("Failed to fetch group tasks.");
      });
  };

  const handleConfirmDownload = () => {
    setShowConfirmPopup(false);
    handleDownloadPdf();
  };

  const handleCancelDownload = () => {
    setShowConfirmPopup(false);
  };

  const isToday = selectedDate.isSame(dayjs(), "day");

  return (
    <div className="stickyheader">
      <div className="userInfo">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            <div className="name_task">
              <h2>Hello, {userInfo.FIRSTNAME || "User"}</h2>
              <p>
                {tasks.length >= 0 && (
                  <>
                    {tasks.reduce(
                      (count, group) => count + group.Returngroups.length,
                      0
                    )}{" "}
                    tasks for {selectedDate.format("DD/MM/YYYY")}
                  </>
                )}
              </p>
            </div>
            <div className="dateselection d-flex align-items-center">
              <div className="d-flex align-items-center">
                <FaSquareCaretLeft
                  className="iconDatechange"
                  onClick={handlePrevDate}
                  title="Previous Date"
                />
                <h5>{selectedDate.format("DD/MM/YYYY")}</h5>
                <FaSquareCaretRight
                  className="iconDatechange"
                  onClick={handleNextDate}
                  title="Next Date"
                />
              </div>
              <div className="icons">
                <BsCalendar2Date
                  onClick={handleCalendarClick}
                  title="Date Selection"
                />
                <IoRepeat title="Reset Date" onClick={handleResetDate} />
              </div>
            </div>
            <div className="icons-main">
              <div className="icons">
                <FaDownload
                  title="Download"
                  onClick={() => setShowConfirmPopup(true)}
                />

                {isToday && (
                  <>
                    <MdEditCalendar title="End Task" onClick={handleEndOfDay} />
                    <Dialog
                      open={open}
                      onClose={handleClose}
                      aria-labelledby="alert-dialog-title"
                      aria-describedby="alert-dialog-description"
                    >
                      <DialogTitle id="alert-dialog-title">
                        {"End Of The Day"}
                      </DialogTitle>
                      <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                          Are you sure? Your tasks will be transferred to the
                          next day.
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button className="endofdayBtn" onClick={handleClose}>
                          Close
                        </Button>
                        <Button
                          className="endofdayBtn"
                          onClick={handleEndOfDayConfirmation}
                          autoFocus
                        >
                          Ok
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </>
                )}
                <FaStar
                  className="favourite"
                  title="Add Favourite"
                  onClick={editShowStared}
                />
                <Dialog
                  open={openFullWidthPopup}
                  onClose={handleCloseFullWidthPopup}
                  aria-labelledby="starmodal-title"
                  aria-describedby="starmodal-description"
                >
                  <Starmodal
                    className="favouriteModal"
                    open={showStared}
                    closeModal={handleCloseFullWidthPopup}
                  />
                </Dialog>
              </div>
            </div>
          </div>
          <div className="progress-main d-flex align-items-center justify-content-around text-center">
            <ProgressBar now={progress} label={`${Math.round(progress)}%`} />
            <span>{`${Math.round(progress)}%`}</span>
          </div>
        </div>
        {showCalendar && <Calendar onDateSelect={handleDateSelect} />}
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
            Are you sure you want to download the PDF report?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDownload} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDownload} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Toaster />
    </div>
  );
}

export default Header;
