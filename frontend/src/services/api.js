import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

export const addPlace = async (placeData) => {
  const response = await api.post('/places', placeData);
  return response.data;
};

export const getNearbyPlaces = async (lat, lng) => {
  const response = await api.get(`/places/nearby?lat=${lat}&lng=${lng}`);
  return response.data;
};

export const getDistance = async (group, name, lat, lng) => {
  const response = await api.get(`/places/distance?group=${group}&name=${encodeURIComponent(name)}&lat=${lat}&lng=${lng}`);
  return response.data;
};

export default api;
