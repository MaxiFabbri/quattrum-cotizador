import './Navbar.css';
import DropdownMenu from './DropdownMenu.jsx';
import React, { use, useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { ParametersContext } from '../../context/ParametersContext.jsx'; // Asegúrate de importar el contexto
import TextButton from '../Utils/TextButton.jsx';


const ProductionNavbar = () => {
    const { logout, userRole, userName } = useContext(AuthContext);
    const { dolarPrice } = useContext(ParametersContext); // Aquí consumes el contexto


    return (
        <nav className="navbar-container sticky">
            <Link to="/" className="navbar-logo-link">
                <img src="/imageslogo-quattrum-370x53.png" alt="Isologo de Quattrum" className="navbar-isologo" />
            </Link>
            <div className='navbar-content'>
                <h4>Dolar hoy: {dolarPrice}</h4>
                <div className='navbar-menu'>
                    <Link to="/production">
                        <h4>Pedidos</h4>
                    </Link>
                    <Link to="/customers">
                        <h4>Clientes</h4>
                    </Link>
                    <Link to="/suppliers">
                        <h4>Proveedores</h4>
                    </Link>
                    {userRole === 'ADMIN' && (
                        <Link to="/users">
                            <h4>Usuarios</h4>
                        </Link>
                    )}
                    {userRole === 'ADMIN' && (
                        <Link to="/parameters">
                            <h4>Parametros</h4>
                        </Link>
                    )}
                </div>
            </div>
            <DropdownMenu user={userName} role={userRole} onLogout={logout} />
        </nav>
    );
};

export default ProductionNavbar;