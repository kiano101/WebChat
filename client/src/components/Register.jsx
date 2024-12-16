import React, {useState} from 'react'
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import BootstrapAlert from './Alert'

const Register = () => {
    const [formData, setFormData] = useState({username: '', email: '', password: ''})
    const [message, setMessage] = useState('')
    const [showAlert, setShowAlert] = useState(null)
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
            setShowAlert({message: 'Welcome! Please login to proceed.', variant: 'success'})
            setTimeout(() => {
                navigate('/login')
            }, 750)
        } catch (error) {
            setShowAlert({message: 'Registration failed! Check your credentials.', variant: 'danger'})
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit()
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
            <h2>Register</h2>
            {message && <p style={{ color: 'red', textAlign: 'center' }}>{message}</p>}
            <form onSubmit={handleSubmit} className='custom-form'>
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
                    onKeyDown={handleKeyDown}
                />
                <button type='submit' className='custom-btn'>Register</button>
                <button type='buttons' className='custom-btn' onClick={goToLogin}>Login</button>
            </form>
        </div>
    )
}

export default Register