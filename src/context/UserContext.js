import React, { createContext, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    
    const [profileImage, setProfileImage] = useState(null); // Estado global de la imagen

    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.profile_image) {
                // Asegúrate de que la imagen tenga un cache buster si existe
                parsedUser.profile_image = `${parsedUser.profile_image}?t=${Date.now()}`;
            }
            return parsedUser;
        }
        return null;
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
        // Usar un hash o timestamp único para la imagen
        const updatedImage = `${newImage}?userId=${user.id}&t=${Date.now()}`;
        setProfileImage(updatedImage);
        setUser((prevUser) => ({ ...prevUser, profile_image: updatedImage }));
        localStorage.setItem("user", JSON.stringify({ ...user, profile_image: updatedImage }));
    };

    return (
        <UserContext.Provider value={{ user, login, logout, updateProfileImage }}>
            {children}
        </UserContext.Provider>
    );
};
