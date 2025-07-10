import { useEffect } from 'react'

import './welcome-page.css'
import { apiClient } from '../../config/axiosConfig.js';


function WelcomePage() {

    useEffect(() => {
        const pingBackend = async () => {
            try {
                await apiClient.get('/health', {
                    method: 'GET',
                    credentials: 'include', // si usás cookies o tokens
                });
                console.log('Backend disponible ✅');
            } catch (err) {
                console.error('Error al contactar el backend ❌', err);
            }
        };

        pingBackend();
    }, []);

    return (
        <div className='welcome-page-container'>
            <img src="logo-quattrum-370x53.png" alt="Isologo de Quattrum" className="welcome-isologo" />
            <h1>Bienvenido al Cotizador de Quattrum</h1>
            <h2>Aguarde un instante</h2>
        </div>
    )
}

export default WelcomePage;