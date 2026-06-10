import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import StudentDetail from './pages/StudentDetail'
import AddStudent from './pages/AddStudent'
import Layout from './components/Layout'
import Register from './pages/Register'
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} /> {/* ADD THIS LINE */}
  <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
    <Route index element={<Dashboard />} />
    <Route path="students" element={<Students />} />
    <Route path="students/add" element={<AddStudent />} />
    <Route path="students/:id" element={<StudentDetail />} />
  </Route>
</Routes>
    </BrowserRouter>
  )
}