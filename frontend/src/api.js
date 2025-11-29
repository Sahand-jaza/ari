const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchHealth = async () => {
  const response = await fetch(`${API_URL}/api/health`);
  return response.json();
};

export default { fetchHealth };
