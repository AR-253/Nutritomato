import React, { createContext, useState } from 'react';

export const ApiContext = createContext();

const ApiContextProvider = (props) => {
    const [url, setUrl] = useState("http://localhost:4000"); // Assuming backend runs on port 4000

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