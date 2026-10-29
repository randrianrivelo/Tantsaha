import axios from 'axios';

// Ton IP actuelle (partage de connexion)
const API_URL = "http://10.203.83.150:5000"; 

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000 // J'augmente le délai à 10s pour être sûr
});

export default api;