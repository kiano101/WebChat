import React, { useState, useContext } from 'react'
import axios from 'axios'
import {useNavigate, Link} from 'react-router-dom'
import AuthContext from '../context/AuthContext'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
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
            navigate('/group-chat')
        } catch (error) {
            alert('Login failed! check your credentials.')
        }
    }
    
    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
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
                />
                <button type='submit'>Login</button>
                <button type='button' onClick={gotToRegister}>Register</button>
            </form>
        </div>
    )
}

export default Login;