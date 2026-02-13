import { addToCart } from "../services/cartService";

const handleAddToCart = async () => {
  try {
    const token = localStorage.getItem("token");

    const result = await addToCart(menu._id, 1, token);

    console.log(result);
    alert("Item added to cart");

  } catch (err) {
    alert(err.response?.data?.message || "Error adding item");
  }
};
