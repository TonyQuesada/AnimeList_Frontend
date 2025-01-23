import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [profileImage, setProfileImage] = useState(null);

    // Llama al servidor para obtener la imagen de perfil más actual
    const fetchProfileImage = async (userId) => {        
        const API = process.env.REACT_APP_BACKEND_URL;
        try {
            const response = await fetch(`${API}/Users/${userId}/profile-image`);
            if (response.ok) {
                const data = await response.json();
                return data.profile_image;
            } else {
                console.error("Error al obtener la imagen del perfil:", response.status);
            }
        } catch (error) {
            console.error("Error fetching profile image:", error);
        }
        return null;
    };

    // Verifica si la imagen de perfil debe ser actualizada
    const updateProfileImage = async () => {
        if (user && user.user_id) {
            const newImage = await fetchProfileImage(user.user_id);
            if (newImage && newImage !== profileImage) {
                setProfileImage(newImage); // Actualiza la imagen de perfil
                setUser((prevUser) => {
                    const updatedUser = { ...prevUser, profile_image: newImage };
                    localStorage.setItem("user", JSON.stringify(updatedUser)); // Actualiza en localStorage
                    return updatedUser;
                });
            }
        }
    };

    // Llama a updateProfileImage cada vez que el usuario se cargue o se actualice
    useEffect(() => {
        if (user) {
            updateProfileImage();
        }
    }, [user]);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    return (
        <UserContext.Provider value={{ user, login, logout, updateProfileImage }}>
            {children}
        </UserContext.Provider>
    );
};
