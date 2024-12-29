import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Favorites from "./pages/Favorites";
import Explorer from "./pages/Explorer";
import Profile from "./pages/Profile";
import Navbar from "./pages/Navbar";
import { ToastContainer } from 'react-toastify';
import { UserProvider, UserContext } from "./context/UserContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(UserContext);
  return user ? children : <Navigate to="/Login" />;
};

function App() {
  return (
    <UserProvider>
      <ToastContainer />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/Login" element={ <Login /> } />
          <Route path="/Register" element={ <Register /> } />
          <Route path="/Favorites" element={ <ProtectedRoute> <Favorites /> </ProtectedRoute> } />          
          <Route path="/Explorer" element={ <ProtectedRoute> <Explorer /> </ProtectedRoute> } />
          <Route path="/Profile" element={ <ProtectedRoute> <Profile /> </ProtectedRoute> } />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
