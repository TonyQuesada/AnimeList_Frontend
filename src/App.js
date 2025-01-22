import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Favorites from "./pages/Favorites";
import Explorer from "./pages/Explorer";
import Profile from "./pages/Profile";
import Navbar from "./pages/Navbar";
import useIsMobile from "./hooks/useIsMobile";
import { ToastContainer } from 'react-toastify';
import { UserContext } from "./context/UserContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(UserContext);
  return user ? children : <Navigate to="/Login" />;
};

function App() {
  
  const { user } = useContext(UserContext);
  const isMobile = useIsMobile();

  return (
    <>
      <ToastContainer autoClose={2000} limit={2} closeOnClick pauseOnHover toastClassName="toast-custom" position={isMobile ? "top-right" : "bottom-right"} hideProgressBar draggable={false} />
      <BrowserRouter>
        {user && <Navbar />}
        <Routes>
          <Route path="/" element={<Navigate to="/Login" />} />
          <Route path="/Login" element={user ? <Navigate to="/Explorer" /> : <Login />} />
          <Route path="/Register" element={ <Register /> } />
          <Route path="/Favorites" element={ <ProtectedRoute> <Favorites /> </ProtectedRoute> } />          
          <Route path="/Explorer" element={ <ProtectedRoute> <Explorer /> </ProtectedRoute> } />
          <Route path="/Profile" element={ <ProtectedRoute> <Profile /> </ProtectedRoute> } />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
