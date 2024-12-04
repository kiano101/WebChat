import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import GroupChat from './components/GroupChat'
import ProtectedRoute from './components/ProtectedRoute'
import PrivateChat from './components/PrivateChat'
import './styles/styles.css'


const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/' element={<Login />}/>
          <Route path='/register' element={<Register />}/>
          <Route path='/login' element={<Login />}/>
          <Route
            path='/group-chat'
            element={
              <ProtectedRoute>
                <GroupChat />
              </ProtectedRoute>
            }
          />
          <Route
            path='/private-chat/:username'
            element={
              <ProtectedRoute>
                <PrivateChat />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App;
