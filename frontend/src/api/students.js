import api from './client'

export const getStudents = () => api.get('/students/')
export const createStudent = data => api.post('/students/', data)
export const getStudent = id => api.get(`/students/${id}`)
export const predictStudent = id => api.post(`/students/${id}/predict`)
export const getPredictionHistory = id => api.get(`/students/${id}/history`)
export const getDashboardStats = () => api.get('/dashboard/stats')
export const getRiskTrend = () => api.get('/dashboard/risk-trend')
export const deleteStudent = id => api.delete(`/students/${id}`)