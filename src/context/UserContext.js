import React, { createContext, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    
    const [profileImage, setProfileImage] = useState(null); // Estado global de la imagen

    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    const updateProfileImage = (newImage) => {
        setProfileImage(newImage);
        setUser((prevUser) => ({ ...prevUser, profile_image: newImage })); // Actualiza el usuario con la nueva imagen
    };

    return (
        <UserContext.Provider value={{ user, login, logout, updateProfileImage }}>
            {children}
        </UserContext.Provider>
    );
};
