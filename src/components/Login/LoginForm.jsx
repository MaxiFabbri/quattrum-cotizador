import React, { useState, useContext } from 'react';
import { AuthProvider, AuthContext } from '../../context/AuthContext.jsx';
import './LoginForm.css';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);

    const handleSubmit = (e) => {
        e.preventDefault();
        login(email, password);
    };

    return (
        <>
            <h2>Por Favor, Inicie sesión</h2>
            <form onSubmit={handleSubmit} className="login-form">
                <label>
                    Email:
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>
                <label>
                    Contraseña:
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>
                <button type="submit">Iniciar sesión</button>
            </form>

        </>

    );
};

export default LoginForm;
