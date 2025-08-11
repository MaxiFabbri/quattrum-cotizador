import { useContext } from 'react'
import { BrowserRouter, Routes, Route, Router } from 'react-router-dom';


import { AuthContext } from './context/AuthContext.jsx';
import WelcomePage from './components/WelcomePage/WelcomePage.jsx';
import LoginForm from './components/Login/LoginForm.jsx';
import Quotations from './components/QuotationsContainer/QuotationContainer.jsx';
import Navbar from './components/Navbar/Navbar.jsx';
import NewQuotationContainer from "./components/NewQuotation/NewQuotationContainer";
import DetailedQuotationContainer from './components/NewQuotation/DetailedQuotationContainer.jsx';
import CustomersContainer from './components/Customers/CustomersContainer.jsx';
import CustomerPaymentList from './components/PaymentMethods/CustomerPaymentsList.jsx';
import CustomerPaymentDetail from './components/PaymentMethods/CustomerPaymentDetail.jsx';
import SupplierPaymentList from './components/PaymentMethods/SupplierPaymentList.jsx';
import SupplierPaymentDetail from './components/PaymentMethods/SupplierPaymentDetail.jsx';
import EditCustomer from './components/Customers/EditCustomer.jsx';
import UsersList from './components/Users/UsersList.jsx';
import EditUserForm from './components/Users/EditUserForm.jsx';
import PasswordUpdate from './components/Users/PasswordUpdate.jsx';
import CreateUserForm from './components/Users/CreateUserForm.jsx';
import { ToastContainer } from 'react-toastify'
import SupplierContainer from './components/Suppliers/SuppliersContainer.jsx';
import EditSupplier from './components/Suppliers/EditSupplier.jsx';
import GeneralParameters from './components/GeneralParameters/GeneralParameters.jsx';


function App() {
  const { isAuthenticated, authenticating } = useContext(AuthContext);

  return (
    <>
      <ToastContainer />
      { authenticating ? 
        <WelcomePage /> :
        <>
          {isAuthenticated ?
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<Quotations />} /> {/* Página principal */}
                <Route path="/customers" element={<CustomersContainer />} /> {/* Página de Clientes */}
                <Route path="/customers/edit/:id" element={<EditCustomer />} />
                <Route path="/customers-payments" element={<CustomerPaymentList/>} /> {/* Página de Formas de pago de Clientes */}
                <Route path="/customers-payments/:id" element={<CustomerPaymentDetail />} /> {/* Página de Editar o Agregar Forma de pago de Cliente */}
                <Route path="/suppliers" element={<SupplierContainer />} /> {/* Página de Proveedores */}
                <Route path="/suppliers/edit/:id" element={<EditSupplier />} /> {/* Página de Proveedor */}
                <Route path="/suppliers-payments" element={<SupplierPaymentList/>} /> {/* Página de Formas de pago de Proveedores */}
                <Route path="/suppliers-payments/:id" element={<SupplierPaymentDetail />} /> {/* Página de Editar o Agregar Forma de pago de Proveedor     */}
                <Route path="/new-quotation" element={<NewQuotationContainer />} /> {/* Página de Nueva Cotización */}
                <Route path="/users/" element={<UsersList />} /> {/* Página de Usuarios */}
                <Route path="/users/new" element={<CreateUserForm />} /> {/* Página de Crear Usuario */}
                <Route path="/users/edit/:id?" element={<EditUserForm />} /> {/* Página de un Usuario */}
                <Route path="/users/password-update" element={<PasswordUpdate />} /> {/* Página de Actualización de Contraseña */}
                <Route path="/detailed-quotation/:id" element={<DetailedQuotationContainer />} />
                <Route path="/parameters" element={<GeneralParameters />} /> {/* Página de Parámetros Generales */}
              </Routes>
            </>
            : <LoginForm />
          }
        </> 
      }
    </>

  )
}

export default App;
