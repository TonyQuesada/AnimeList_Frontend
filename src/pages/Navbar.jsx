import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { IoMdLogOut } from "react-icons/io";
import { AiOutlineSearch, AiOutlineHeart, AiOutlineUser } from "react-icons/ai"; // Icono de perfil
import "../assets/styles/navbar.css";

const Navbar = () => {
    const { user, logout } = useContext(UserContext);
    const [menuOpen, setMenuOpen] = useState(false);

    if (!user) {
        return null;
    }

    const toggleMenu = () => setMenuOpen(!menuOpen);

    return (
        <nav className="navbar">
            <div className="navbar-left">
                {/* Logo ajustado para modo responsive */}
                <Link to="/Explorer" className="navbar-logo-link">
                    <img src="/favicon.png" alt="Logo" className="navbar-logo" />
                </Link>
                <Link to="/Explorer" className="navbar-title-link">
                    <span className="navbar-title">Anime List</span>
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
                <button className="menu-toggle" onClick={toggleMenu}>
                    ☰
                </button>
            </div>

            {/* Responsive Icons */}
            <div className="navbar-responsive-icons">
                
                <Link to="/Explorer" className="responsive-icon">
                    <img src="/favicon.png" alt="Logo" className="navbar-logo" />
                </Link>

                <Link to="/Explorer" className="responsive-icon">
                    <AiOutlineSearch />
                </Link>
                <Link to="/Favorites" className="responsive-icon">
                    <AiOutlineHeart />
                </Link>
                <Link to="/Profile" className="responsive-icon">
                    <AiOutlineUser /> {/* Icono de perfil */}
                </Link>
                <Link onClick={logout} className="responsive-icon">
                    <IoMdLogOut />
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
