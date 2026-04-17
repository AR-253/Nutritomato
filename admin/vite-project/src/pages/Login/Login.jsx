import React, { useState } from 'react'
import './Login.css'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = ({ url, setToken }) => {

    const [data, setData] = useState({
        email: "",
        password: ""
    })

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    const onLogin = async (event) => {
        event.preventDefault()
        try {
            const response = await axios.post(url + "/api/user/login", data)
            if (response.data.success) {
                setToken(response.data.token)
                localStorage.setItem("token", response.data.token);
            }
            else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error("Error")
        }
    }

    return (
        <div className='login-popup'>
            <form onSubmit={onLogin} className="login-popup-container">
                <div className="login-popup-title">
                    <h2>Admin Panel</h2>
                </div>
                <div className="login-popup-inputs">
                    <input onChange={onChangeHandler} name='email' value={data.email} type="email" placeholder='Your email' required />
                    <input onChange={onChangeHandler} name='password' value={data.password} type="password" placeholder='Password' required />
                </div>
                <button type='submit'>Login</button>
            </form>
        </div>
    )
}

export default Login
