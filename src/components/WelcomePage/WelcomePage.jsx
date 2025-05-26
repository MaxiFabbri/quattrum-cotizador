import { useContext } from 'react'
import { BrowserRouter, Routes, Route, Router } from 'react-router-dom';

import { AuthContext } from '../../context/AuthContext.jsx';
import './welcome-page.css'



function WelcomePage() {


    return(
        <div className='welcome-page-container'>
            <img src="logo-quattrum-370x53.png" alt="Isologo de Quattrum" className="welcome-isologo"/>
            <h1>Bienvenido al Cotizador de Quattrum</h1>
            <h2>Aguarde un instante</h2>
        </div>
    )
} 

export default WelcomePage;