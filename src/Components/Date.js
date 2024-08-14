// src/Components/DateContext.js
import React, { createContext, useContext, useState } from 'react';
import dayjs from 'dayjs';

const DateContext = createContext();

export const useDate = () => useContext(DateContext);

export const DateProvider = ({ children }) => {
    const [selectedDate, setSelectedDate] = useState(dayjs());

    return (
        <DateContext.Provider value={{ selectedDate, setSelectedDate }}>
            {children}
        </DateContext.Provider>
    );
};
