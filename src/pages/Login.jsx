import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import "../assets/styles/login.css";
import { BiHide } from "react-icons/bi";
import { BiShowAlt } from "react-icons/bi";


const Login = () => {

  const API = process.env.REACT_APP_BACKEND_URL;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useContext(UserContext); // Obtiene la función `login` del contexto
  const navigate = useNavigate();
  
  // Estado para controlar la visibilidad de la contraseña
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
      e.preventDefault();

      try {
          const response = await fetch(`${API}/Login`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify({ username, password }),
          });

          const data = await response.json();

          if (response.ok) {
              login(data.user); // Guarda el usuario en el contexto
              navigate("/Explorer"); // Redirige a la página de favoritos
          } else {
              setError("Credenciales inválidas.");
          }
      } catch (err) {
          console.error("Error:", err);
          setError("Ocurrió un error, intenta nuevamente.");
      }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <img src="/favicon.png" alt="Logo" className="logo" />
        <h2>Iniciar Sesión</h2>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}  // Cambia el tipo según el estado showPassword
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
              />

              <button type="button" className="icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ?  <BiShowAlt /> : <BiHide />}
              </button>
              
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="btn">Iniciar Sesión</button>
          <p className="register-link">
              ¿No tienes una cuenta? <a href="/Register">Regístrate aquí</a>
          </p>
      </form>
    </div>
  );
};

export default Login;
