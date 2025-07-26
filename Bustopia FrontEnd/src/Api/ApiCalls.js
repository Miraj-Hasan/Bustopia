import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;



export const login = async (loginData) => {

  const response = await axios.post(`${API_BASE_URL}/api/login`, loginData, {
    withCredentials: true,
  });
  return response;
};

export const register = async (formData) => {
  const response = await axios.post(`${API_BASE_URL}/api/register`, formData, {
    withCredentials: true,
  });
  return response;
};

export const verifyEmailLink = async (code, email) => {
  const response = await axios.get(
    `${API_BASE_URL}/api/verify-registration`,
    {
      params: { code, email },
      withCredentials: true,
    }
  );
  return response;
};


export const sendResetEmail = async (email) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/forgot-password`,
    { email },
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",              // ei header dewa optional ... na dileo hobe
      },
    }
  );
  return response;
};


export const resetPassword = async (password, token) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/reset-password/${token}`,
    { password },
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response;
};

export const logOutFromServer = async () => {
  const response = await axios.post(`${API_BASE_URL}/api/logout`, {}, {
    withCredentials: true,
  });
  return response;
};


export const updateProfileInfo = async (formData) => {

  const response = await axios.put(`${API_BASE_URL}/api/user/update`, formData, {
    withCredentials: true,
  });
  return response;
};

export const getCurrentUser = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/me`, {
    withCredentials: true,
  });
  return response;
};


export const getAllCompanies = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/getAllCompanies`, {
    withCredentials: true,
  });
  return response;
}

export const getSpecificBus = async (license, userId) => {
  const response = await axios.get(`${API_BASE_URL}/api/getReviewsByLicenseNo`, {
    params: { 
      licenseNo: license,
      userId: userId 
    },
    withCredentials: true,
  });
  return response;
}

export const getSpecificCompanyBuses = async (companyName, pageToFetch, size,  userId) => {
  const response = await axios.get(`${API_BASE_URL}/api/getSpecificCompanyBuses`, {
    params: { companyName: companyName, 
      page: pageToFetch,
      size: size,
      userId: userId
     }, 
    withCredentials: true,
  });
  return response;
}

export const getReviewsByBusId = async (busId) => {
  const response = await axios.get(`${API_BASE_URL}/api/getReviewsByBusId`, {
    params: { 
      busId: busId 
    }, 
    withCredentials: true,
  });
  return response;
}

export const getTravelledBuses = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/api/getTravelledBuses`, {
    params: { 
      userId: userId 
    },
    withCredentials: true,
  });
  return response;
}


export const uploadReviewImages = async (formData) => {
  const response = await axios.post(`${API_BASE_URL}/api/reviews/uploadReviewImages`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    withCredentials: true
  });
  return response;
};

export const submitReview = async (reviewData) => {
  const response = await axios.post(`${API_BASE_URL}/api/reviews`, reviewData, {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response;
};

export const verifyTicket = async (ticketCode, companyName) => {
  const response = await axios.get(
    `${API_BASE_URL}/api/verifyTicket`,
    {
      params: { ticketCode, companyName },
      withCredentials: true,
    }
  );
  return response;
};

// =================== Buy Ticket API Calls ===================

// Get all stops
export const getAllStops = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/all_stops`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};
// Get destinations based on source
export const getDestinationsForSource = async (source) => {
  const response = await axios.get(`${API_BASE_URL}/api/destinations`, {
    params: { source },
    withCredentials: true,
  });
  return response;
};


// Fetch available buses based on source, destination, date, and time
export const fetchAvailableBuses = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/buses/available`, formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Available buses response:", response.data);
    return response;
  } catch (error) {
    throw error;
  }
};

// Book a ticket
export const bookTicket = async (bookingData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/tickets/book`, bookingData, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Get seat layout for a specific bus
export const getSeatLayout = async (busId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/seat-layouts/bus/${busId}`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};


// Get booked seats for a specific bus and date
export const getBookedSeats = async (busId, date) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/seat-availability/bus/${busId}/date/${date}`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};


export const initiatePayment = async (paymentData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/payment/initiate`, paymentData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Fetch tickets bought by a user
export const getUserTickets = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/tickets/user`, {
    params: { userId },
    withCredentials: true,
  });
  return response;
};

// Cancel a ticket by ticketId
export const cancelTicket = async (ticketId) => {
  return await axios.post(`${API_BASE_URL}/tickets/cancel`, { ticketId }, { withCredentials: true });
};

export const getTicketSales = async () => {
  const response = await axios.get(`${API_BASE_URL}/tickets/admin/ticket-sales`, {
    withCredentials: true,
  });
  return response;
};

export const getAllTickets = async () => {
  const response = await axios.get(`${API_BASE_URL}/tickets/admin/all-tickets`, {
    withCredentials: true,
  });
  return response;
};

export const getAllReviews = async () => {
  const response = await axios.get(`${API_BASE_URL}/tickets/admin/all-reviews`, {
    withCredentials: true,
  });
  return response;
};