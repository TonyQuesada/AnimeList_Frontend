import React, { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { IoMdLogOut } from "react-icons/io";
import { AiOutlineSearch, AiOutlineHeart } from "react-icons/ai";
import "../assets/styles/navbar.css";

const Navbar = () => {
    const { user, logout, profileImage } = useContext(UserContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const [pageTitle, setPageTitle] = useState("");

    useEffect(() => {
        // Establecer el título de la página basado en la ruta actual
        switch (location.pathname) {
            case "/Explorer":
                setPageTitle("Explorar Animes");
                break;
            case "/Favorites":
                setPageTitle("Favoritos");
                break;
            case "/Profile":
                setPageTitle("Perfil");
                break;
            default:
                setPageTitle("");
        }
    }, [location]);
    
    return (
        <>
            {/* Navbar superior */}
            <nav className="navbar">
                <div className="navbar-left">
                    <Link to="/Explorer" className="navbar-logo-link">
                        <img src="/favicon.png" alt="Logo" className="navbar-logo" />
                    </Link>
                    <Link to="/Explorer" className="navbar-title-link">
                        <span className="navbar-title">Anime Library</span>
                    </Link>
                </div>

                <div className={`navbar-center ${menuOpen ? "open" : ""}`}>
                    <Link to="/Explorer" className="navbar-link">
                        Explorar Animes
                    </Link>
                    <Link to="/Favorites" className="navbar-link">
                        Favoritos
                    </Link>
                </div>

                <div className="navbar-right">
                    <div className="user-menu">
                        <Link to="/Profile" className="user-name">
                            {user.username}
                        </Link>
                        <Link className="dropdown-item logout" onClick={logout}>
                            <IoMdLogOut />
                        </Link>
                    </div>
                </div>

                {/* Nombre de la vista actual en la versión responsive */}
                <div className="navbar-title-responsive">
                    <span>{pageTitle}</span>
                </div>

                <div className="navbar-right-responsive">
                    <div className="user-menu">
                        <Link className="dropdown-item logout" onClick={logout}>
                            <IoMdLogOut />
                        </Link>
                    </div>
                </div>

            </nav>

            {/* Navbar con los íconos en la parte inferior */}
            <div className="navbar-responsive-icons">
                <Link to="/Explorer" className="responsive-icon">
                    <AiOutlineSearch />
                    <span>Explorar</span> {/* Texto siempre visible */}
                </Link>
                <Link to="/Favorites" className="responsive-icon">
                    <AiOutlineHeart />
                    <span>Favoritos</span> {/* Texto siempre visible */}
                </Link>
                <Link to="/Profile" className="responsive-icon">
                    <img
                        src={
                            profileImage ||
                            user?.profile_image ||
                            "https://res.cloudinary.com/dpkl9nczj/image/upload/v1736823969/profile_oztcom.png"
                        }
                        alt="Perfil"
                        className="profile-image navbar-logo"
                        onError={(e) =>
                            (e.target.src =
                            "https://res.cloudinary.com/dpkl9nczj/image/upload/v1736823969/profile_oztcom.png")
                        }
                    />
                    <span>Perfil</span> {/* Texto siempre visible */}
                </Link>
            </div>

        </>
    );
};

export default Navbar;
