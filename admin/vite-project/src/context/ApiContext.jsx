import React, { createContext, useState } from 'react';

export const ApiContext = createContext();

const ApiContextProvider = (props) => {
    // Dynamically use environment variable if present (Vite uses import.meta.env)
    const [url, setUrl] = useState(import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:4000"); 

    const contextValue = {
        url
    };

    return (
        <ApiContext.Provider value={contextValue}>
            {props.children}
        </ApiContext.Provider>
    );
};

export default ApiContextProvider;