import { useContext } from 'react'
import { BrowserRouter, Routes, Route, Router } from 'react-router-dom';

import { AuthContext } from './context/AuthContext.jsx';
import LoginForm from './components/Login/LoginForm.jsx';
import Quotations from './components/QuotationsContainer/QuotationContainer.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import NewQuotationContainer from "./components/NewQuotation/NewQuotationContainer";
import DetailedQuotationContainer from './components/NewQuotation/DetailedQuotationContainer.jsx';
import CustomersContainer from './components/Customers/CustomersContainer.jsx';



function App() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <>
      {isAuthenticated ?
        <>
          <Navbar />          
          <Routes>
            <Route path="/" element={<Quotations />} /> {/* Página principal */}
            <Route path="/customers" element={<CustomersContainer />} /> {/* Página de Clientes */}
            <Route path="/new-quotation" element={<NewQuotationContainer />} /> {/* Página de Nueva Cotización */}
            <Route path="/detailed-quotation/:id" element={<DetailedQuotationContainer />} />
          </Routes>

        </>
        : <LoginForm />
      }
    </>
  )
}

export default App;
