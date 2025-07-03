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

// Fetch available buses based on source, destination, date, and time
export const fetchAvailableBuses = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/buses/available`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Book a ticket
export const bookTicket = async (bookingData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/tickets/book`, bookingData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};