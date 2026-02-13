import axios from "axios";

const API = "http://localhost:5000/api/cart";

export const addToCart = async (menuItemId, quantity, token) => {
  try {
    const res = await axios.post(
      `${API}/add`,
      { menuItemId, quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return res.data;
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw error;
  }
};
