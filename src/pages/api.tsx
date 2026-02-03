import axios from "axios";
import { API_BASE_URL } from '../config/constants';

// Instancia básica de Axios
const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
