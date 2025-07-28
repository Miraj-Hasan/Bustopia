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
import CancelTicket from './Pages/CancelTicket/CancelTicket';
import Analytics from './Pages/Analytics/Analytics';
import AdminDashboard from './Pages/AdminDashboard/AdminDashboard';
import AdminWelcome from './Pages/AdminWelcome/AdminWelcome';
import { useContext } from 'react';
import { UserContext } from './Context/UserContext';
import BusInfo from './Pages/BusInfo/BusInfo';

function App() {
  const { user } = useContext(UserContext);

  // Conditional component for root route
  const RootComponent = () => {
    if (user && user.role === 'ROLE_ADMIN') {
      return <AdminWelcome />;
    } else {
      return (
        <>
          <Home />
          <ChatWidget />
        </>
      );
    }
  };

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RootComponent />
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
        <Route path="/review" element={
            <Review />
        } />
        <Route path="/bus/:busid" element={<BusInfo />} />
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

            <Payment />

          }
        />
        <Route path="/ticket-verification" element={<TicketVerification />} />
        <Route path="/payment-result" element={<PaymentResult />} />
        <Route path="/cancel-ticket" element={<CancelTicket />} />

        <Route path="/homepage" element={<>
          <Home />
          <ChatWidget />
        </>} />

        {/* Admin Routes */}
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<h1>Invalid Path, Man</h1>} />
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
