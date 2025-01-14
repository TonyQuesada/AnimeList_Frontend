import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; // Importar Toastify
import 'react-toastify/dist/ReactToastify.css'; // Estilos de Toastify
import { UserContext } from "../context/UserContext";
import { FaTrashAlt } from 'react-icons/fa';
import '../assets/styles/style.css';
import Select from 'react-select';

const Explorer = () => {

    const { user, logout } = useContext(UserContext);
    const API = process.env.REACT_APP_BACKEND_URL;

    const [animeList, setAnimeList] = useState([]);  // Lista de animes obtenidos
    const [favorites, setFavorites] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [search, setSearch] = useState('');  // Campo de búsqueda
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);  // Indica si hay más páginas
    
    // Estado para `itemsPerPage`
    const [itemsPerPage, setItemsPerPage] = useState(16);    

    const [selectedCategories, setSelectedCategories] = useState([]); // Estado para categorías seleccionadas

    useEffect(() => {
        // Función para ajustar `itemsPerPage` según el tamaño de pantalla
        const updateItemsPerPage = () => {
            const width = window.innerWidth;

            if (width >= 1583) {
                setItemsPerPage(16);
            } else if (width <= 1582 && width >= 1388) {
                setItemsPerPage(14);
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

        // Llama a la función una vez al cargar la página
        updateItemsPerPage();

        // Agrega el evento de redimensionamiento
        window.addEventListener('resize', updateItemsPerPage);

        // Limpia el evento al desmontar el componente
        return () => window.removeEventListener('resize', updateItemsPerPage);
    }, []); // Se ejecuta solo al montar el componente

    useEffect(() => {
        // Actualiza la lista de animes cada vez que `itemsPerPage` cambie
        setCurrentPage(1); // Resetea a la primera página
        fetchAnime(1); // Vuelve a hacer la llamada al API con los nuevos límites
    }, [itemsPerPage]);
    
    useEffect(() => {
        if (!user) {
            logout();
        }

        const fetchStatuses = async () => {
            try {
                const res = await axios.get(`${API}/StatusesAnime`);
                setStatuses(res.data);
            } catch (err) {
                console.log(err);
            }
        };

        const fetchFavorites = async () => {
            try {
                const res = await axios.get(`${API}/Favorites?user_id=${user.user_id}`);
                setFavorites(res.data);
            } catch (err) {
                console.log(err);
            }
        };

        fetchStatuses();
        fetchFavorites();
        fetchAnime();
        
    }, [user, logout]);

    const fetchAnime = async (page = 1) => {
        
        // Limpiar datos anteriores antes de hacer la solicitud
        setAnimeList([]);

        try { 
            const apiUrl = search.length > 0 || selectedCategories.length > 0
                ? `https://api.jikan.moe/v4/anime?page=${page}&limit=${itemsPerPage}&order_by=start_date&sort=desc&min_episodes=1&q=${search}&genres=${selectedCategories.join(',')}`
                : `https://api.jikan.moe/v4/anime?page=${page}&limit=${itemsPerPage}&order_by=start_date&sort=desc&min_episodes=1&status=airing&sfw&genres=${selectedCategories.join(',')}`;

            const res = await axios.get(apiUrl);
            setAnimeList(res.data.data);  // Almacena los animes en el estado
            setHasNextPage(res.data.pagination.has_next_page);  // Actualiza si hay más páginas
        } catch (err) {
            console.log(err);
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleSearchClick = () => {
        setCurrentPage(1);
        fetchAnime(1);
    };

    const handleCategoryChange = (selectedOptions) => {
        const value = selectedOptions ? selectedOptions.map(option => option.value) : [];
        setSelectedCategories(value);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchAnime(page);
    };

    const handleStatusChangeFavorite = async (anime_id, newStatusId) => {
        try {

            // Realizar la solicitud a la API de Jikan para obtener los detalles del anime
            const response = await fetch(`https://api.jikan.moe/v4/anime/${anime_id}`);
            const animeDetails = await response.json();
    
            // Si no se encuentra el anime, salimos
            if (!animeDetails || !animeDetails.data) {
                console.error("No se encontraron detalles para el anime con ID:", anime_id);
                return;
            }

            // Extraer los detalles necesarios
            const anime = animeDetails.data;
            
            await axios.put(`${API}/Favorites/AddOrUpdate`, {
                api_id: anime.mal_id,
                title: anime.title || "Título no disponible",
                synopsis: anime.synopsis || "Sinopsis no disponible",
                image_url: anime.images?.jpg?.image_url || "",
                user_id: user.user_id,
                status_id: newStatusId,
                year: anime.aired?.prop?.from?.year || "No definido",
            }).catch(err => {
                console.error("Error en la solicitud axios:", err.response || err.message);
            });

            const existingFavorite = favorites.find(fav => fav.api_id === anime_id);
            var isNewFavorite = !existingFavorite;
            // Actualizar la lista de favoritos localmente
            setFavorites(prev => {
                const favoriteExists = prev.find(fav => fav.api_id === anime_id);
                if (favoriteExists) {
                    return prev.map(fav =>
                        fav.api_id === anime_id ? { ...fav, status_id: newStatusId } : fav
                    );
                } else {
                    return [
                        ...prev,
                        { anime_id, status_id: newStatusId, api_id: anime_id, title: anime.title },
                    ];
                }
            });

            // Mostrar la alerta solo después de la actualización exitosa
            if (isNewFavorite) {
                toast.success(`El anime "${anime.title}" fue agregado a favoritos`);
            } else {
                toast.success(`El estado de "${anime.title}" fue actualizado`);
            }

        } catch (err) {
            console.error('Error al cambiar el estado del favorito:', err.message);
        }
    };
        
    const handleDeleteFavorite = async (anime_id) => {
        try {
            await axios.delete(`${API}/Favorites/API_id/${anime_id}`, {
                data: { user_id: user.user_id },
            });

            setFavorites(favorites.filter(fav => fav.api_id !== anime_id));
        } catch (err) {
            console.log(err);
        }
    };
    
    const confirmDeleteFavorite = (anime_id) => {
        toast(
            <div>
                <p>¿Estás seguro de eliminar este favorito?</p>
                <button
                    className="toast-confirm-btn"
                    onClick={() => {
                        handleDeleteFavorite(anime_id);
                        toast.dismiss(); // Cierra el toast manualmente
                    }}
                >
                    Sí
                </button>
                <button
                    className="toast-cancel-btn"
                    onClick={() => toast.dismiss()} // Cierra el toast si se cancela
                >
                    No
                </button>
            </div>,
            {
                position: "top-center",
                autoClose: false, // Mantén el toast abierto hasta que se confirme o cancele
                closeOnClick: false,
                draggable: false,
                closeButton: false,
                className: "toast-confirmation", // Clase CSS personalizada (opcional)
            }
        );
    };

    const getPageNumbers = () => {
        const pages = [];
        const delta = 1;

        if (currentPage > delta + 1) {
            pages.push(1);
            if (currentPage > delta + 2) pages.push('...');
        }

        for (let i = Math.max(currentPage - delta, 1); i <= currentPage; i++) {
            pages.push(i);
        }

        if (hasNextPage) {
            pages.push(currentPage + 1);
        }

        return pages;
    };

    return (
        <div>
            <div className="filters">
                <input
                    type="text"
                    placeholder="Buscar animes..."
                    value={search}
                    onChange={handleSearchChange}
                    className="search-input"
                />

                 {/* Select para categorías múltiples */}
                <Select
                    isMulti
                    options={[
                        { value: "1", label: "Acción" },
                        { value: "2", label: "Aventura" },
                        { value: "3", label: "Autos" },
                        { value: "4", label: "Comedia" },
                        { value: "23", label: "Colegial" },
                        { value: "36", label: "Cosas de la Vida" },
                        { value: "5", label: "Dementia" },
                        { value: "6", label: "Demonios" },
                        { value: "30", label: "Deportes" },
                        { value: "8", label: "Drama" },
                        { value: "9", label: "Ecchi" },
                        { value: "10", label: "Fantasía" },
                        { value: "35", label: "Harem" },
                        { value: "12", label: "Hentai" },
                        { value: "13", label: "Histórico" },
                        { value: "36", label: "Isekai" },
                        { value: "43", label: "Josei" },
                        { value: "11", label: "Juegos" },
                        { value: "16", label: "Magia" },
                        { value: "18", label: "Mecha" },
                        { value: "38", label: "Militar" },
                        { value: "7", label: "Misterio" },
                        { value: "19", label: "Música" },
                        { value: "15", label: "Niños" },
                        { value: "20", label: "Parodia" },
                        { value: "39", label: "Policial" },
                        { value: "40", label: "Psicológico" },
                        { value: "22", label: "Romance" },
                        { value: "21", label: "Samurái" },
                        { value: "24", label: "Ciencia Ficción" },
                        { value: "42", label: "Seinen" },
                        { value: "25", label: "Shoujo" },
                        { value: "26", label: "Shoujo Ai" },
                        { value: "27", label: "Shounen" },
                        { value: "28", label: "Shounen Ai" },
                        { value: "37", label: "Sobrenatural" },
                        { value: "29", label: "Espacial" },
                        { value: "31", label: "Superpoderes" },
                        { value: "14", label: "Terror" },
                        { value: "41", label: "Thriller" },
                        { value: "32", label: "Vampiros" },
                        { value: "33", label: "Yaoi" },
                        { value: "34", label: "Yuri" },
                    ]}
                    value={selectedCategories.map(value => ({ value, label: value }))}
                    onChange={handleCategoryChange}
                />

                <button onClick={handleSearchClick} className="search-button">Buscar</button>
            </div>

            <div className="favoritos">
                {animeList.map((anime) => {
                    const favorite = favorites.find(fav => fav.api_id === anime.mal_id);
                    const currentStatusId = favorite ? favorite.status_id : 0;

                    return (
                        <div className="favorito" key={anime.mal_id}>
                            {anime.images?.jpg?.image_url && (
                                <img src={anime.images.jpg.image_url} alt={anime.title} />
                            )}
                            <h2>{anime.title ? anime.title : "Título no disponible"}</h2>
                            <p>{anime.synopsis ? anime.synopsis : "Sinopsis no disponible"}</p>

                            <div className="status-container">
                                {/* Select de estado */}
                                <select
                                    className="status-select"
                                    value={currentStatusId}
                                    onChange={(e) =>
                                        handleStatusChangeFavorite(anime.mal_id, parseInt(e.target.value))
                                    }
                                >
                                    <option value="0">Sin asignar</option>
                                    {statuses.map((status) => (
                                        <option key={status.status_id} value={status.status_id}>
                                            {status.status_name}
                                        </option>
                                    ))}
                                </select>

                                {/* Botón de eliminar */}
                                {favorite && (                                    
                                    <button
                                        className="delete-btn"
                                        onClick={() => confirmDeleteFavorite(anime.mal_id)}
                                    >
                                        <FaTrashAlt />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Paginación */}
            <div className="pagination">
                <button
                    hidden={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    &lt;&lt;
                </button>

                {getPageNumbers().map((page, index) => (
                    page === "..." ? (
                        <span key={index} className="dots">...</span>
                    ) : (
                        <button
                            key={index}
                            onClick={() => handlePageChange(page)}
                            className={page === currentPage ? "active" : ""}
                        >
                            {page}
                        </button>
                    )
                ))}

                <button
                    hidden={!hasNextPage}
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    &gt;&gt;
                </button>
            </div>

        </div>
    );
};

export default Explorer;
