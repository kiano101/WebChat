import React, { useState, useContext } from 'react'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import AuthContext from '../context/AuthContext'
import BootstrapAlert from './Alert'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showAlert, setShowAlert] = useState(null)
    const {login} = useContext(AuthContext)
    const navigate = useNavigate()

    const gotToRegister = () => {
        navigate('/register')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {email, password})
            const {token, username} = response.data;
            login({token, username});
            localStorage.setItem('token', token)
            localStorage.setItem('username', username)
            setShowAlert({message: 'Welcome Back!', variant: 'success'})
            setTimeout(() => {
                navigate('/group-chat')
            }, 750)
        } catch (error) {
            setShowAlert({message: 'Login failed! Check your credentials.', variant: 'danger'})
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e)
        }
    }
    
    return (
        <div>
            {showAlert && (
                <BootstrapAlert 
                    message={showAlert.message}
                    variant={showAlert.variant}
                    duration={500} 
                    onClose={() => setShowAlert(null)} 
                />
            )}
            <h2>Login</h2>
            <form onSubmit={handleSubmit} className='custom-form'>
                <input
                    type='email'
                    placeholder='Email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder='Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button type='submit' className='custom-btn'>Login</button>
                <button type='button' className='custom-btn' onClick={gotToRegister}>Register</button>
            </form>
        </div>
    )
}

export default Login;