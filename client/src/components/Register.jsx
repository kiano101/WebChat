import React, {useState} from 'react'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'

const Register = () => {
    const [formData, setFormData] = useState({username: '', email: '', password: ''})
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }))
    }

    const goToLogin = () => {
        navigate('/login')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', formData)
            console.log(response)
            setMessage(response.data.message)
            navigate('/login')
        } catch (error) {
            setMessage(error.response?.data?.message || 'Something went wrong')
            console.log(message)
        }
    }

    return (
        <div>
            <h2>Register</h2>
            {message && <p style={{ color: 'red', textAlign: 'center' }}>{message}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder='Username'
                    name='username'
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <input
                    type='email'
                    placeholder='Email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    placeholder='Password'
                    name='password'
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <button type='submit'>Register</button>
                <button type='buttons' onClick={goToLogin}>Login</button>
            </form>
        </div>
    )
}

export default Register