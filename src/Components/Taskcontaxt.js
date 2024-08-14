// Taskcontaxt.js

import React, { createContext, useContext, useState } from 'react';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [checkedTasks, setCheckedTasks] = useState([]);

    const updateCheckedTasks = (taskId) => {

        const index = checkedTasks.indexOf(taskId);
        if (index === -1) {
            const updatedTasks = [...checkedTasks, taskId];
            setCheckedTasks(updatedTasks);
            localStorage.setItem("checkedTasks", JSON.stringify(updatedTasks));
        } else {
            const updatedTasks = checkedTasks.filter((id) => id !== taskId);
            setCheckedTasks(updatedTasks);
            localStorage.setItem("checkedTasks", JSON.stringify(updatedTasks));
        }
    };

    return (
        <TaskContext.Provider value={{ tasks, setTasks, checkedTasks, updateCheckedTasks }}>
            {children}
        </TaskContext.Provider>
    );
};
