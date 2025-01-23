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
        const updatedImage = `${newImage}?t=${Date.now()}`; // Agrega un timestamp único
        setProfileImage(updatedImage);
        setUser((prevUser) => ({ ...prevUser, profile_image: updatedImage })); // Actualiza el usuario con la nueva URL
        localStorage.setItem("user", JSON.stringify({ ...user, profile_image: updatedImage })); // Guarda en localStorage
    };

    return (
        <UserContext.Provider value={{ user, login, logout, updateProfileImage }}>
            {children}
        </UserContext.Provider>
    );
};
