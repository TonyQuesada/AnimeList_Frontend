import React, { useEffect, useState, useContext  } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { toast } from 'react-toastify'; // Importar Toastify
import 'react-toastify/dist/ReactToastify.css'; // Estilos de Toastify
import '../assets/styles/style.css';
import '../assets/styles/profile.css';
import { BiHide } from "react-icons/bi";
import { BiShowAlt } from "react-icons/bi";
import { FaPencilAlt } from "react-icons/fa";
import 'react-image-crop/dist/ReactCrop.css'; 

const Profile = () => {

  const { user, logout, updateProfileImage } = useContext(UserContext);
  const API = process.env.REACT_APP_BACKEND_URL;

  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: ''
  });
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  // Estados para las contraseñas
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [image, setImage] = useState(null);

  useEffect(() => {

    // Cargar los datos del usuario al componente
    axios.get(`${API}/users/${user.user_id}`)
      .then(response => {
        setUserData(response.data);
        setFormData({
          fullname: response.data.fullname,
          username: response.data.username,
          email: response.data.email
        });
        setStatus(response.data.status_id);
      })
      .catch(err => {
        console.error("Error al cargar los datos del usuario:", err);
      });
  }, [user.user_id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Limpiar los errores cuando el usuario modifique el campo
    if (error) setError(null);
    if (passwordError) setPasswordError('');
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    if (passwordError) setPasswordError(''); // Limpiar el error de la contraseña cuando el usuario la modifique
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();

    // Validación de contraseñas coincidentes
    if (passwordData.password !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      toast.error('Las contraseñas no coinciden.'); 
      return;
    }

    // Validación de email y username únicos
    try {
      const res = await axios.post(`${API}/users/validate`, { 
        email: formData.email, 
        username: formData.username, 
        userId: user.user_id
      });

      if (res.data.valid) {
        // Actualizar los datos
        await axios.put(`${API}/users/${user.user_id}`, formData);
        if (passwordData.password) {
          // Actualizar la contraseña
          await axios.put(`${API}/users/UpdatePassword/${user.user_id}`, {
            password: passwordData.password,
          });
        }
        setPasswordError(null);
        setError(null); // Limpiar cualquier mensaje de error
        toast.success('Perfil actualizado con éxito'); // Mostrar éxito con Toastify
      } else {
        setError('El correo electrónico o el nombre de usuario ya están en uso.');
        toast.error('El correo electrónico o el nombre de usuario ya están en uso.'); // Error con Toastify
      }
    } catch (err) {
      setError('Hubo un error al actualizar el perfil.');
      toast.error('Hubo un error al actualizar el perfil.'); // Error con Toastify
      console.error(err);
    }
  };
  
  const handleImageChange = async (event) => {
    const file = event.target.files[0]; // Obtiene el archivo del evento
    if (!file) return; // Si no hay archivo, no hacer nada

    const username = user.username; // Obtén el username desde userData
    if (!username) {
        console.error("El username no está definido.");
        return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const response = await axios.post(
        `${API}/uploadProfileImage?username=${username}`,  // El username se pasa como parámetro en la URL
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
      );
          
      // Imprimir para depuración
      console.log("Respuesta del servidor:", response.data);

      // Aquí se actualiza el estado para reflejar la nueva foto de perfil
      const updatedUserData = { ...userData, profile_image: response.data.imageUrl };
      console.log("Datos actualizados:", updatedUserData);
      setUserData(updatedUserData); // Actualiza el estado local para que se renderice la nueva imagen
      updateProfileImage(response.data.imageUrl);

    } catch (error) {
      console.error("Error al subir la imagen:", error.response?.data || error.message);
    }
  };


  if (!userData) return null;

  return (
    <div className="profile-container">

      <div className="image-container">
        {!image && !userData.profile_image && <span>Cargando...</span>}
        <img src={image || (userData.profile_image ? `${userData.profile_image}?${new Date().getTime()}` : 'default-image.jpg')} alt="Foto de perfil" className="profile-image" onError={(e) => (e.target.src = 'default-image.jpg')} />
        {/* Ícono de lápiz en la parte inferior derecha */}
        <label htmlFor="file-upload" className="edit-icon">
          <FaPencilAlt />
        </label>
        <input type="file" id="file-upload" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
      </div>

      <br />
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre Completo</label>
          <input
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Nombre de Usuario</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled
          />
        </div>

        <div className="form-group">
          <label>Correo Electrónico</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        {/* Cambio de contraseña */}
        <div className="form-group">
          <label>Nueva Contraseña</label>
          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={passwordData.password}
              onChange={handlePasswordChange}
              placeholder='Nueva Contraseña'
            />
            <button type="button" onClick={togglePasswordVisibility}>
                <div className="icon">
                    {showPassword ?  <BiShowAlt /> : <BiHide />}
                </div>
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Confirmar Contraseña</label>
          <div className="password-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder='Confirmar Contraseña'
            />
            <button type="button" onClick={toggleConfirmPasswordVisibility}>
                <div className="icon">
                    {showConfirmPassword ?  <BiShowAlt /> : <BiHide />}
                </div>
            </button>
          </div>
        </div>        

        {passwordError && <div className="error-message">{passwordError}</div>}
        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="btn">Actualizar Perfil</button>
      </form>

    </div>
  );
};

export default Profile;
