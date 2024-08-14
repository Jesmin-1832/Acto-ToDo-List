import React, { useState, useRef, useEffect } from "react";
import "./css/sidebar.css";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CloseIcon from "@mui/icons-material/Close";
import { Link, useNavigate } from "react-router-dom";
import { IoClose, IoHomeOutline } from "react-icons/io5";
import {
  MdBusinessCenter,
  MdWifiCalling3,
  MdFamilyRestroom,
  MdAddCircle,
} from "react-icons/md";
import { RiMenuFold4Fill } from "react-icons/ri";
import { TbCategoryPlus, TbLogout } from "react-icons/tb";
import { HiPlusCircle } from "react-icons/hi";
import { GiProgression } from "react-icons/gi";
import { BiTask } from "react-icons/bi";
import { PiDotsThreeOutline } from "react-icons/pi";
import Business from "./Business";
import Header from "./Header";
import Call from "./Call";
import Family from "./Family";
import Other from "./Other";
import Home from "./Home";
import UserModal from "./Usermodal";
import MyProjectsModal from "./MyProjectsModal";
import ProfileModal from "./ProfileModal";
import CategoryForm from "./CategoryForm";
import Axios from "axios";
import { Delete, Edit } from "@mui/icons-material";
import { API_BASE_URL } from "./ApiMain";
import MyProjectsTask from "./MyProjectTask";
import toast, { Toaster } from "react-hot-toast";
import { useMediaQuery } from "@mui/material";
import { FaAngleLeft } from "react-icons/fa";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const items = [
  {
    id: "home",
    text: "Home",
    icon: <IoHomeOutline />,
    component: <Home />,
    link: "/home",
  },
  {
    id: "business",
    text: "Business",
    icon: <MdBusinessCenter />,
    component: <Business />,
    link: "/business",
  },
  {
    id: "call",
    text: "Call",
    icon: <MdWifiCalling3 />,
    component: <Call />,
    link: "/call",
  },
  {
    id: "family",
    text: "Family",
    icon: <MdFamilyRestroom />,
    component: <Family />,
    link: "/family",
  },
  {
    id: "other",
    text: "Other",
    icon: <RiMenuFold4Fill />,
    component: <Other />,
    link: "/other",
  },
];

export default function MiniDrawer() {
  const [user, setUser] = useState(null);
  const [selectedItem, setSelectedItem] = useState("home");
  const [showModal, setShowModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false); // Added for CategoryForm
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [openProjectIndex, setOpenProjectIndex] = useState(null);
  const [projectid, setProjectid] = useState("");
  const [editingProject, setEditingProject] = useState(null);
  const [categoryedit, SetcategoryEdit] = useState(null);
  const [myProjectTaskToggle, setMyProjectTaskToggle] = useState(false);
  const changeBoxRef = useRef(null);
  const theme = useTheme();
  const drawerRef = useRef(null);
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const [selectedProject, setSelectedProject] = useState(null);
  const [userInfo, setUserInfo] = useState({});
  const [categories, setCategories] = useState([]);
  const [openCategoryIndex, setOpenCategoryIndex] = useState(null);
  const changeCategoryRef = useRef(null);

  const userInfoData = () => {
    const userData = JSON.parse(localStorage.getItem("userid"));
    const userInfo = JSON.parse(localStorage.getItem("userinfo"));
    setUser(userData);
    setUserInfo(userInfo || {});
    if (userData) {
      fetchProjectData(userData);
      handlecategoryget(userData);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    userInfoData();
  }, []);

  useEffect(() => {
    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const fetchProjectData = (loginId) => {
    Axios.get(`${API_BASE_URL}/Project?LoginId=${loginId}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        setProjects(res.data.projectList || []);
        userInfoData();
      })
      .catch((err) => {
        setProjects([]);
      });
  };

  let handlecategoryget = (userid) => {
    Axios.get(`${API_BASE_URL}/Group?LoginId=${userid}`)
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    handlecategoryget();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        changeCategoryRef.current &&
        !changeCategoryRef.current.contains(event.target)
      ) {
        setOpenCategoryIndex(null);
      }
    }

    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleCategoryIconClick = (index) => {
    setOpenCategoryIndex(openCategoryIndex === index ? null : index);
  };

  const handleListItemClick = (item) => {
    setSelectedItem(item.id);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  const handleDrawerClose1 = () => {
    const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;
    if (isSmallScreen) {
      setOpen(false);
    }
  };

  const extractUsername = (email) => {
    const match = email ? email.match(/^([a-zA-Z]+)[0-9]*/) : null;
    return match ? match[1] : "Guest";
  };

  const handleUserImageClick = () => {
    setShowModal(true);
  };

  const handleProfileClick = () => {
    setShowProfileModal(true); // Open ProfileModal
  };

  const handleMyProjectsClick = () => {
    setEditingProject(null);
    setShowProjectsModal(true);
  };

  const handleAddCategoryClick = () => {
    SetcategoryEdit(null);
    setShowCategoryForm(true);
  };

  const closeProjectsModal = () => {
    setShowProjectsModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false); // Close ProfileModal
  };

  const closeCategoryForm = () => {
    setOpenCategoryIndex(null);
    setShowCategoryForm(false); // Close CategoryForm
  };

  const addProject = (projectName) => {
    const newProject = { ProjectName: projectName };
    setProjects((prevProjects) => [...prevProjects, newProject]);
  };

  const toggleChangeBox = (index) => {
    setOpenProjectIndex(index === openProjectIndex ? null : index);
  };

  const handleClickOutside = (event) => {
    if (changeBoxRef.current && !changeBoxRef.current.contains(event.target)) {
      setOpenProjectIndex(null);
    }
  };

  const handleDelete = (projectId) => {
    Axios.post(`${API_BASE_URL}/Project/Delete`, {
      ProjectId: projectId,
      LoginId: user,
    })
      .then((res) => {
        toast.success("Task Removed Succesfully..", {
          position: "bottom-left",
        });
        setProjects((projects) =>
          projects.filter((project) => project.ProjectId !== projectId)
        );
        setOpenCategoryIndex(null);
      })
      .catch((err) => {
        console.error("Error deleting project:", err);
      });
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowProjectsModal(true);
    toggleChangeBox(null);
  };

  const handleEditSave = (editedProject) => {
    const updatedProjects = projects.map((project) =>
      project.ProjectId === editedProject.ProjectId ? editedProject : project
    );
    setProjects(updatedProjects);
    toast.success("Task Updated Succesfully..", {
      position: "bottom-left",
    });
    setShowProjectsModal(false);
  };

  const handleProjectItemClick = (project, projectid) => {
    setSelectedProject(project);
    setMyProjectTaskToggle(true);
    setProjectid(projectid);
  };

  const editCategory = (category) => {
    SetcategoryEdit(category);
    setShowCategoryForm(true);
    setOpenCategoryIndex(null);
  };

  const handleCategorySave = (updatedCategory) => {
    // Save the updated category data
    Axios.post(`${API_BASE_URL}/Group/Updatecategory`, {
      LoginId: user,
      GroupId: updatedCategory.GroupId, // Use the GroupId from the updated category
      GroupName: updatedCategory.GroupName, // Use the updated category name
    })
      .then(() => {
        setShowCategoryForm(false);
        handlecategoryget(user); // Refresh categories
      })
      .catch((err) => {
        console.error("Error updating category:", err);
        toast.error("Failed to update category.");
      });
  };

  const handlecategoryDelete = (groupid) => {
    Axios.post(`${API_BASE_URL}/Group/Deletecategory`, {
      LoginId: user,
      GroupId: groupid,
    })
      .then(() => {
        toast.success("Category deleted successfully.", {
          position: "bottom-left",
        });
        setOpenCategoryIndex(null);
      })
      .catch((err) => {
        console.error("Error deleting category:", err);
        toast.error("Failed to delete category.");
      });
  };

  return (
    <div className="sidebar">
      <Box sx={{ display: "flex" }}>
        <div ref={drawerRef}>
          <CssBaseline />
          <AppBar position="fixed" open={open}></AppBar>
          <Drawer variant="permanent" open={open}>
            <div style={{ height: "90%", overflow: "scroll" }}>
              <DrawerHeader>
                <div className="userDetails" onClick={handleProfileClick}>
                  <div className="userImage">
                    {userInfo.Image ? (
                      <img src={userInfo.Image} />
                    ) : (
                      <img src="https://testtodolistapi.actoscript.com/staticimage/userIcon.jpg" />
                    )}
                  </div>
                  <div className="username">
                    <p>{userInfo.FIRSTNAME}</p>
                    <span>{userInfo.UserEmailId}</span>
                  </div>
                </div>
                <IconButton className="closeBtn" onClick={handleDrawerClose}>
                  <FaAngleLeft />
                </IconButton>
              </DrawerHeader>
              <Divider />
              <div className="weeklyreport" onClick={handleUserImageClick}>
                <p>
                  <GiProgression />
                </p>
                <span>Weekly Report</span>
              </div>

              <List style={{ borderTop: "1px solid Lightgray" }}>
                {items.map((item) => (
                  <ListItem
                    className="ActiveBtn"
                    key={item.id}
                    disablePadding
                    onClick={() => handleListItemClick(item)}
                    button
                    component={Link}
                    to={item.link}
                    selected={selectedItem === item.id}
                  >
                    <ListItemButton
                      sx={{ minHeight: 48, justifyContent: "center", px: 2.5 }}
                    >
                      <ListItemIcon
                        sx={{ minWidth: 0, justifyContent: "center" }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItemButton>
                  </ListItem>
                ))}
                <a className="addcategory" onClick={handleAddCategoryClick}>
                  <TbCategoryPlus />
                  <span>
                    Add Category <MdAddCircle />
                  </span>
                </a>

                <div className="categoryList">
                  {categories.map((category, index) => (
                    <ListItem key={category.id} disablePadding button>
                      <ListItemButton
                        sx={{
                          minHeight: 48,
                          justifyContent: "center",
                          px: 2.5,
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            justifyContent: "center",
                            display: "flex",
                            alignItems: "center",
                            marginRight: "10px",
                          }}
                        >
                          <span className="category-initial">
                            {category.GroupName.charAt(0).toUpperCase()}
                          </span>
                        </ListItemIcon>
                        <ListItemText primary={category.GroupName} />
                        <PiDotsThreeOutline
                          className="categoryTaskIcon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCategoryIconClick(index);
                          }}
                        />
                        {openCategoryIndex === index && (
                          <div
                            ref={changeCategoryRef}
                            className="changeCategory"
                          >
                            <span>
                              <Edit onClick={() => editCategory(category)} />
                            </span>
                            <span>
                              <Delete
                                onClick={() =>
                                  handlecategoryDelete(category.GroupId)
                                }
                              />
                            </span>
                          </div>
                        )}
                      </ListItemButton>
                    </ListItem>
                  ))}
                </div>
              </List>

              <Divider />
              <Link className="myprojectBtn" onClick={handleMyProjectsClick}>
                <BiTask />
                <span>
                  My Projects <HiPlusCircle />
                </span>
              </Link>
              <div className="myprojectTitle">
                <ul>
                  {projects.map((project, index) => (
                    <li key={project.ProjectId}>
                      <div>
                        <p
                          onClick={() =>
                            handleProjectItemClick(project, project.ProjectId)
                          }
                        >
                          {index + 1}
                        </p>
                        <span>
                          <div
                            onClick={() =>
                              handleProjectItemClick(project, project.ProjectId)
                            }
                          >
                            {project.ProjectName}
                          </div>
                          <h6
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleChangeBox(index);
                            }}
                          >
                            <PiDotsThreeOutline />
                          </h6>
                          <div
                            ref={changeBoxRef}
                            className={`changeBox ${openProjectIndex === index ? "open" : ""
                              }`}
                          >
                            <span onClick={() => handleEdit(project)}>
                              <Edit />
                            </span>
                            <span
                              onClick={() => handleDelete(project.ProjectId)}
                            >
                              <Delete />
                            </span>
                          </div>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Link to={"/logout"} className="logoutBtn">
              <TbLogout /> <span>Log Out</span>
            </Link>
          </Drawer>

          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
        </div>
        {showCategoryForm && <CategoryForm onClose={closeCategoryForm} />}
        {isSmallScreen && open && (
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: theme.zIndex.drawer - 1,
              overflow: "auto",
            }}
            onClick={handleDrawerClose1}
            className={open ? "css-zxdg2z-overflow" : ""}
          />
        )}

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
          }}
        >
          <Header />
          {items.map(
            (item) =>
              selectedItem === item.id && (
                <Box key={item.id}>{item.component}</Box>
              )
          )}
        </Box>
      </Box>

      <UserModal showModal={showModal} closeModal={closeModal} />
      <MyProjectsModal
        open={showProjectsModal}
        handleClose={closeProjectsModal}
        addProject={addProject}
        project={fetchProjectData}
        editingProject={editingProject}
        handleEditSave={handleEditSave}
      />
      <ProfileModal
        open={showProfileModal}
        handleClose={closeProfileModal}
        userInfo={userInfo}
      />
      <MyProjectsTask
        open={myProjectTaskToggle}
        handleClose={() => setMyProjectTaskToggle(false)}
        addProject={addProject}
        project={fetchProjectData}
        editingProject={selectedProject}
        projectid={projectid}
        handleEditSave={handleEditSave}
      />
      <CategoryForm
        open={showCategoryForm}
        handleClose={closeCategoryForm}
        categoryedit={categoryedit}
        handleSave={handleCategorySave}
      />
      <Toaster />
    </div>
  );
}
