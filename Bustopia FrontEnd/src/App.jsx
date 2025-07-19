import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from './Components/RouterProtection/ProtectedRoute';
import ForgotPassword from './Pages/ForgotPassword/ForgotPassword';
import { Home } from './Pages/Home/Home';
import Login from './Pages/Login/LogIn'
import { LogOut } from './Pages/LogOut/Logout';
import OAuthSuccess from './Pages/OAuthSuccess/OAuthSuccess';
import { Profile } from './Pages/Profile/Profile';
import Register from './Pages/Register/Register';
import ResetPassword from './Pages/ResetPassword/ResetPassword';
import Verify from './Pages/VerifyEmail/Verify';
import Review from './Pages/Review/Review';
import TicketVerification from './Pages/TicketVerification/TicketVerification';
import ChatWidget from './Components/ChatWidget/ChatWidget';
import BuyTicket from './Pages/BuyTicket/BuyTicket';
import Payment from './Pages/Payment/Payment';
import PaymentResult from './Pages/Payment/PaymentResult';

function App() {

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
              <ChatWidget />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        ></Route>

        <Route path="/logout" element={<LogOut />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/review" element={<Review />} />
        <Route
          path="/buy-ticket"
          element={
            <ProtectedRoute>
              <BuyTicket />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment" element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route path="/ticket-verification" element={<TicketVerification />} />
        <Route path="/payment-result" element={<PaymentResult />} />

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
