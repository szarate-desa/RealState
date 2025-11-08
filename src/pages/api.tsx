import axios from "axios";

// URL base local
const API_BASE_URL = "http://localhost:3000";

// Instancia básica de Axios
const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
