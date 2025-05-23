import { useContext } from 'react'
import { BrowserRouter, Routes, Route, Router } from 'react-router-dom';

import { AuthContext } from '../../context/AuthContext.jsx';



function WelcomePage() {


    return(
        <>
            <h1>Bienvenido al Cotizador de Quattrum</h1>
            <h2>Aguarde mientras validamos el usuario</h2>
        </>
    )
} 

export default WelcomePage;