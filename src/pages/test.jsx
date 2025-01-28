import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; // Importar Toastify
import 'react-toastify/dist/ReactToastify.css'; // Estilos de Toastify
import { UserContext } from "../context/UserContext";
import { FaTrashAlt, FaFilter } from 'react-icons/fa';
import { IoFilter } from "react-icons/io5";
import '../assets/styles/style.css';
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';

const Favorites = () => {

    const { user, logout } = useContext(UserContext);
    const API = process.env.REACT_APP_BACKEND_URL;
    
    const [favorites, setFavorites] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [statusFilter, setStatusFilter] = useState([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(Infinity);
    const [sortOrder, setSortOrder] = useState(''); // Nuevo estado para ordenación

    useEffect(() => {

        if (!user) { logout(); }

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
    
            // Definimos los rangos y valores en un arreglo
            const ranges = [
                { maxWidth: 595, items: 16 },
                { maxWidth: 799, items: 12 },
                { maxWidth: 995, items: 8 },
                { maxWidth: 1191, items: 15 },
                { maxWidth: 1387, items: 18 },
                { maxWidth: 1582, items: 14 },
                { maxWidth: 1780, items: 16 },
                { maxWidth: 1976, items: 18 },
                { maxWidth: 2171, items: 20 },
                { maxWidth: 2367, items: 22 },
                { maxWidth: 2563, items: 24 },
                { maxWidth: 2759, items: 26 },
                { maxWidth: Infinity, items: 28 }, // Cualquier valor mayor
            ];
    
            // Buscamos el primer rango que coincide
            const matchedRange = ranges.find(range => width <= range.maxWidth);
            if (matchedRange) setItemsPerPage(matchedRange.items);
        };
    
        updateItemsPerPage(); // Llamada inicial
        window.addEventListener('resize', updateItemsPerPage); // Actualiza al cambiar tamaño de ventana
    
        return () => window.removeEventListener('resize', updateItemsPerPage); // Limpieza del evento
    }, []);    

    // Mover la vista al tope al cambiar de página
    useEffect(() => {
        if (isMobile) { // Solo en dispositivos móviles
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'auto' // Animación suave
            });
        }
    }, [currentPage]);


    // Actualizar el estado del anime en la base de datos
    const handleStatusChangeFavorite = async (anime_id, newStatusId) => {
        try {
            await axios.put(`${API}/Favorites/Update/${anime_id}`, {
                user_id: user.user_id,
                status_id: newStatusId,
            });

            // Encuentra el anime en la lista local para obtener su título
            const updatedAnime = favorites.find(fav => fav.anime_id === anime_id);

            // Si no se encuentra, salimos
            if (!updatedAnime) {
                console.error("Anime no encontrado en los favoritos locales");
                return;
            }

            // Actualiza el estado localmente después de la actualización en la base de datos
            setFavorites(favorites.map(fav =>
                fav.anime_id === anime_id ? { ...fav, status_id: newStatusId } : fav
            ));
            
            // Mostrar mensaje de éxito con el título del anime
            toast.success(`El estado de "${updatedAnime.title}" fue actualizado`);

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

    const handleSearchChange = (e) => { setSearch(e.target.value); }; // Handle filtering by title
    const handleStatusChange = (e) => { setStatusFilter(e.value); }; // Handle status filter change
    const handleSortChange = (value) => { setSortOrder(value); }; // Manejar cambio en el select de ordenación

    // Filter favorites based on title and status
    const filteredData = favorites.filter(favorito => {
        const matchesTitle = favorito.title.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter.length === 0 || statusFilter.includes(favorito.status_id);
        return matchesTitle && matchesStatus;
    });

    // Filtrar y ordenar favoritos
    const filteredAndSortedData = filteredData.sort((a, b) => {
        if (sortOrder === 'name') {
            return a.title.localeCompare(b.title); // Ordenar por nombre (alfabéticamente)
        } else if (sortOrder === 'dateAdded') {            
            const dateComparison = new Date(b.date_added) - new Date(a.date_added); // Ordenar primero por fecha            
            if (dateComparison === 0) { // Si las fechas son iguales, ordenar por nombre
                return a.title.localeCompare(b.title); // Si las fechas son iguales, ordenar alfabéticamente por nombre
            }            
            return dateComparison; // Si no, devolver el resultado de la comparación de fecha
        } else {            
            const dateComparison = new Date(b.date_added) - new Date(a.date_added); // Ordenar primero por fecha
            if (dateComparison === 0) { // Si las fechas son iguales, ordenar por nombre
                return a.title.localeCompare(b.title); // Si las fechas son iguales, ordenar alfabéticamente por nombre
            }            
            return dateComparison; // Si no, devolver el resultado de la comparación de fecha
        }
    });
        
    // Paginate filtered data
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
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

    const isMobile = window.innerWidth <= 768;

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

                {/* Select de estado */}
                <MultiSelect
                    value={statusFilter}
                    options={statuses.map((status) => ({
                        label: status.status_name,
                        value: status.status_id
                    }))}
                    onChange={(e) => handleStatusChange(e)}
                    placeholder= {isMobile ? <FaFilter className='filter-exp' /> : "Estado"}
                    maxSelectedLabels={isMobile ? 0 : 1} 
                    className="w-full md:w-20rem"
                    optionLabel="label"  // Especifica el label para mostrar
                    showClear={isMobile ? false : true}
                    panelClassName="multiselect-fav"
                    selectedItemsLabel={isMobile ? <FaFilter className='filter-exp' /> : `${statusFilter.length} estados`}
                    emptyFilterMessage="No se encontraron resultados"
                />

                {/* Nuevo select de ordenación */}
                <Dropdown
                    value={sortOrder}  // El valor seleccionado
                    options={[
                        { label: "Nombre", value: "name" },
                        { label: "Fecha de agregado", value: "dateAdded" },
                    ]}
                    onChange={(e) => handleSortChange(e.value)}  // Cuando se selecciona una nueva opción
                    placeholder={isMobile ? `<IoFilter className="filter-exp" />` : "Ordenar"}
                    className="w-full md:w-20rem"
                    optionLabel="label"
                    panelClassName="multiselect-fav"
                    showClear={isMobile ? false : true}
                    valueTemplate={isMobile ? <IoFilter className="filter-exp" /> : sortOrder.label }
                    emptyFilterMessage="No se encontraron resultados"
                />
            </div>

            <div className="favoritos">
                {currentItems.map((favorito) => (
                    <div className="favorito" key={favorito.anime_id}>
                        {favorito.image_url && <img src={favorito.image_url} alt={favorito.title} />}
                        
                        <div className="favorito-contenido">
                            <h2>{favorito.title}</h2>
                            <p>{favorito.description}</p>
                            
                            <div className="status-container">

                                {/* Select para cambiar el estado */}
                                <Dropdown
                                    value={favorito.status_id} // El valor seleccionado
                                    options={statuses.map((status) => ({
                                        label: status.status_name,
                                        value: status.status_id,
                                    }))} // Opciones del dropdown
                                    onChange={(e) => handleStatusChangeFavorite(favorito.anime_id, parseInt(e.value)) } // Evento cuando cambie la selección
                                    className="w-full md:w-20rem status-dropdown" // Clases personalizadas
                                    panelClassName="dropdown-panel" // Panel de opciones
                                />

                                {/* Botón de eliminar favorito */}
                                <button
                                    className="delete-btn-fav"
                                    onClick={() => confirmDeleteFavorite(favorito.anime_id)}
                                >
                                    <FaTrashAlt className="fav-icon"/>
                                </button>
                            </div>
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