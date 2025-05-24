import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from './Components/RouterProtection/ProtectedRoute';
import ForgotPassword from './Pages/ForgotPassword/ForgotPassword';
import { Home } from './Pages/Home/Home';
import Login from './Pages/Login/LogIn'
import { LogOut } from './Pages/LogOut/Logout';
import OAuthSuccess from './Pages/OAuthSuccess/OAuthSuccess';
import Register from './Pages/Register/Register';
import ResetPassword from './Pages/ResetPassword/ResetPassword';
import Verify from './Pages/VerifyEmail/Verify';


function App() {

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route path='/logout' element={<LogOut/>}/>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />

        <Route path="*" element={<h1>Balchal dio na guru</h1>} />
      </Routes>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App
