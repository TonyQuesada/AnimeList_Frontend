import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from "../context/UserContext";
import { FaTrashAlt } from 'react-icons/fa';
import '../assets/styles/style.css';

const Favorites = () => {

    const { user, logout } = useContext(UserContext);
    const API = process.env.REACT_APP_BACKEND_URL;
    
    const [favorites, setFavorites] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(16);

    useEffect(() => {

        if (!user) {
            logout();
        }

        const fetchAllFavorites = async () => {
            try {
                const res = await axios.get(`${API}/Favorites?user_id=${user.user_id}`);                
                setFavorites(res.data);
            } catch (err) {
                console.log(err);
            }
        };

        const fetchStatuses = async () => {
            try {
                const res = await axios.get(`${API}/StatusesAnime`);
                setStatuses(res.data);
            } catch (err) {
                console.log(err);
            }
        };

        fetchAllFavorites();
        fetchStatuses();
    }, [user, logout]);

    // Detectar cambio de tamaño de la ventana y ajustar el límite de elementos por página
    useEffect(() => {
        const updateItemsPerPage = () => {
            const width = window.innerWidth;

            if (width >= 1583) {
                setItemsPerPage(16);
            } else if (width <= 1582 && width >= 1388) {
                setItemsPerPage(21);
            } else if (width <= 1387 && width >= 1192) {
                setItemsPerPage(18);
            } else if (width <= 1191 && width >= 996) {
                setItemsPerPage(15);
            } else if (width <= 995 && width >= 800) {
                setItemsPerPage(16);
            } else if (width <= 799 && width >= 596) {
                setItemsPerPage(12);
            } else if (width <= 595) {
                setItemsPerPage(16);
            }
        };

        updateItemsPerPage(); // Llamada inicial
        window.addEventListener('resize', updateItemsPerPage); // Actualiza al cambiar tamaño de ventana

        return () => window.removeEventListener('resize', updateItemsPerPage); // Limpieza del evento
    }, []);

    // Actualizar el estado del anime en la base de datos
    const handleStatusChangeFavorite = async (anime_id, newStatusId) => {
        try {
            await axios.put(`${API}/Favorites/Update/${anime_id}`, {
                user_id: user.user_id,
                status_id: newStatusId,
            });

            // Actualiza el estado localmente después de la actualización en la base de datos
            setFavorites(favorites.map(fav =>
                fav.anime_id === anime_id ? { ...fav, status_id: newStatusId } : fav
            ));
        } catch (err) {
            console.log(err);
        }
    };

    // Eliminar un favorito
    const handleDeleteFavorite = async (anime_id) => {
        try {
            await axios.delete(`${API}/Favorites/${anime_id}`, {
                data: { user_id: user.user_id },
            });

            // Eliminar el anime de la lista localmente
            setFavorites(favorites.filter(fav => fav.anime_id !== anime_id));
        } catch (err) {
            console.log(err);
        }
    };

    // Handle filtering by title
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    // Handle status filter change
    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
    };

    // Filter favorites based on title and status
    const filteredData = favorites.filter(favorito => {
        const matchesTitle = favorito.title.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter ? favorito.status_id === parseInt(statusFilter) : true;
        return matchesTitle && matchesStatus;
    });

    // Paginate filtered data
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Crea la lógica para los números de las páginas
    const getPageNumbers = () => {
        const pages = [];
        const delta = 1; // Cuántas páginas alrededor de la actual se deben mostrar

        // Mostrar páginas iniciales (si es necesario)
        if (currentPage > delta + 1) {
            pages.push(1);
            if (currentPage > delta + 2) pages.push('...');
        }

        // Páginas cercanas a la página actual
        for (let i = Math.max(currentPage - delta, 1); i <= Math.min(currentPage + delta, totalPages); i++) {
            pages.push(i);
        }

        // Mostrar páginas finales (si es necesario)
        if (currentPage < totalPages - delta - 1) {
            if (currentPage < totalPages - delta - 2) pages.push('...');
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div>

            <div className="filters">

                <input
                    type="text"
                    placeholder="Buscar favoritos..."
                    value={search}
                    onChange={handleSearchChange}
                    className="search-input"
                />

                <select onChange={handleStatusChange} value={statusFilter} className="status-select">
                    <option value="" hidden>Estado</option>
                    <option value="">Todos</option>
                    {statuses.map((status) => (
                        <option key={status.status_id} value={status.status_id}>
                            {status.status_name}
                        </option>
                    ))}
                </select>

            </div>

            <div className="favoritos">
                {currentItems.map((favorito) => (
                    <div className="favorito" key={favorito.anime_id}>
                        {favorito.image_url && <img src={favorito.image_url} alt={favorito.title} />}
                        <h2>{favorito.title}</h2>
                        <p>{favorito.description}</p>
                        
                        <div className="status-container">
                            {/* Select para cambiar el estado */}
                            <select
                                className="status-select"
                                value={favorito.status_id}
                                onChange={(e) => handleStatusChangeFavorite(favorito.anime_id, parseInt(e.target.value))}
                            >
                                {statuses.map((status) => (
                                    <option key={status.status_id} value={status.status_id}>
                                        {status.status_name}
                                    </option>
                                ))}
                            </select>

                            {/* Botón de eliminar favorito */}
                            <button
                                className="delete-btn"
                                onClick={() => handleDeleteFavorite(favorito.anime_id)}
                            >
                                <FaTrashAlt /> {/* Usamos el ícono aquí */}
                            </button>
                        </div>

                    </div>
                ))}
            </div>

            {/* Paginación */}
            <div className="pagination">
                {/* Botón de "Anterior" */}
                <button 
                    hidden={currentPage === 1 || totalPages === 0}
                    onClick={() => setCurrentPage(currentPage - 1)}
                >
                    &lt;&lt;
                </button>

                {/* Números de páginas */}
                {getPageNumbers().map((page, index) => (
                    page === "..." ? (
                        <span key={index} className="dots">...</span>
                    ) : (
                        <button
                            key={index}
                            onClick={() => setCurrentPage(page)}
                            className={page === currentPage ? "active" : ""}
                        >
                            {page}
                        </button>
                    )
                ))}

                {/* Botón de "Siguiente" */}
                <button 
                    hidden={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(currentPage + 1)}
                >
                    &gt;&gt;
                </button>
            </div>

        </div>
    );
};


export default Favorites