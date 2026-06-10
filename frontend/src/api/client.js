import axios from 'axios'

// This tells the app: "Use the Vercel Environment Variable if it exists, 
// otherwise fallback to localhost for development"
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({ 
  baseURL: API_BASE_URL 
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
export const deleteStudent = id => api.delete(`/students/${id}`)