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
    headers: {
      "Content-Type": "multipart/form-data",
    },
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
