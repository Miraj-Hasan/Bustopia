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

export const getSpecificBus = async (license) => {
  const response = await axios.get(`${API_BASE_URL}/api/getReviewsByLicenseNo`, {
    params: { licenseNo: license },
    withCredentials: true,
  });
  return response;
}

export const getSpecificCompanyBuses = async (companyName, pageToFetch, size) => {
  const response = await axios.get(`${API_BASE_URL}/api/getSpecificCompanyBuses`, {
    params: { companyName: companyName, 
      page: pageToFetch,
      size: size
     }, 
    withCredentials: true,
  });
  return response;
}

export const getReviewsByBusId = async (busId) => {
  const response = await axios.get(`${API_BASE_URL}/api/getReviewsByBusId`, {
    params: { busId: busId }, 
    withCredentials: true,
  });
  return response;
}
