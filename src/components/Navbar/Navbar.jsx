import './Navbar.css';
import React, { use, useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { ParametersContext } from '../../context/ParametersContext.jsx'; // Asegúrate de importar el contexto
import TextButton from '../Utils/TextButton.jsx';


const Navbar = () => {
    const { logout, userRole, userName } = useContext(AuthContext);
    const { dolarPrice } = useContext(ParametersContext); // Aquí consumes el contexto

    return (
        <nav className="navbar-container sticky">
            <Link to="/" className="navbar-logo-link">
                <img src="logo-quattrum-370x53.png" alt="Isologo de Quattrum" className="navbar-isologo" />
            </Link>
            <div className='navbar-content'>
                <div className='navbar-user-info'>
                    <h4>Dolar hoy: {dolarPrice}</h4>
                    <h3>{userName}</h3>
                    <Link to="/users/password-update">
                        <TextButton text="Cambiar PW" />
                    </Link>
                    <TextButton text="Cerrar Sesión" onClick={logout} />
                </div>
                <div className='navbar-menu'>
                    <Link to="/">
                        <TextButton text="Cotizaciones" />
                    </Link>
                    <Link to="/customers">
                        <TextButton text="Clientes" />
                    </Link>
                    <Link to="/customers-payments">
                        <TextButton text="Formas de Cobro" />
                    </Link>
                    <Link to="/suppliers">
                        <TextButton text="Proveedores" />
                    </Link>
                    <Link to="/suppliers">
                        <TextButton text="Formas de Pago" />
                    </Link>
                    {userRole === 'ADMIN' && (
                        <Link to="/users">
                            <TextButton text="Usuarios" />
                        </Link>
                    )}
                    {userRole === 'ADMIN' && (
                        <Link to="/parameters">
                            <TextButton text="Parametros Generales" />
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;