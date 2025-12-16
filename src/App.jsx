import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthContext } from './context/AuthContext.jsx';
import { ToastContainer } from 'react-toastify';

// Componentes comunes
import WelcomePage from './components/WelcomePage/WelcomePage.jsx';
import LoginForm from './components/Login/LoginForm.jsx';

// Navbar
import Navbar from './components/Navbar/Navbar.jsx';
import ProductionNavbar from './components/Navbar/ProductionNavbar.jsx';

// Cotizaciones
import Quotations from './components/QuotationsContainer/QuotationContainer.jsx';
import NewQuotationContainer from './components/NewQuotation/NewQuotationContainer.jsx';
import DetailedQuotationContainer from './components/NewQuotation/DetailedQuotationContainer.jsx'

// Clientes
import CustomersContainer from './components/Customers/CustomersContainer.jsx';
import EditCustomer from './components/Customers/EditCustomer.jsx';
import CustomerPaymentList from './components/PaymentMethods/CustomerPaymentsList.jsx';
import CustomerPaymentDetail from './components/PaymentMethods/CustomerPaymentDetail.jsx';

// Proveedores
import SupplierContainer from './components/Suppliers/SuppliersContainer.jsx';
import EditSupplier from './components/Suppliers/EditSupplier.jsx';
import SupplierPaymentList from './components/PaymentMethods/SupplierPaymentList.jsx';
import SupplierPaymentDetail from './components/PaymentMethods/SupplierPaymentDetail.jsx';

// Usuarios
import UsersList from './components/Users/UsersList.jsx';
import EditUserForm from './components/Users/EditUserForm.jsx';
import PasswordUpdate from './components/Users/PasswordUpdate.jsx';
import CreateUserForm from './components/Users/CreateUserForm.jsx';

// Parámetros
import GeneralParameters from './components/GeneralParameters/GeneralParameters.jsx';

// Producción
import JobsContainer from './components/JobsContainer/JobsContainer.jsx';
import DetailedJobContainer from './components/Jobs/DetailedJobContainer.jsx';

// WebSocket Test
import WebSocketTestPage from './components/WebSocketTest/WebSocketTestPage.jsx';

// Layout para Cotizaciones
function QuotationsLayout() {
  return (
    <>
      <Navbar />
      <Outlet /> {/* Aquí se renderizan las rutas hijas */}
    </>
  );
}

// Layout para Producción
function ProductionLayout() {
  return (
    <>
      <ProductionNavbar />
      <Outlet /> {/* Aquí se renderizan las rutas hijas */}
    </>
  );
}


function App() {
  const { isAuthenticated, authenticating } = useContext(AuthContext);

  return (
    <>
      <ToastContainer />
      {authenticating ? (
        <WelcomePage />
      ) : (
        <>
          {isAuthenticated ? (
            <Routes>
              {/* Layout Cotizaciones */}
              <Route element={<QuotationsLayout />}>
                <Route path="/" element={<Quotations />} />
                <Route path="/new-quotation" element={<NewQuotationContainer />} />
                <Route path="/detailed-quotation/:id" element={<DetailedQuotationContainer />} />

                {/* Clientes */}
                <Route path="/customers" element={<CustomersContainer />} />
                <Route path="/customers/edit/:id" element={<EditCustomer />} />
                <Route path="/customers-payments" element={<CustomerPaymentList />} />
                <Route path="/customers-payments/:id" element={<CustomerPaymentDetail />} />

                {/* Proveedores */}
                <Route path="/suppliers" element={<SupplierContainer />} />
                <Route path="/suppliers/edit/:id" element={<EditSupplier />} />
                <Route path="/suppliers-payments" element={<SupplierPaymentList />} />
                <Route path="/suppliers-payments/:id" element={<SupplierPaymentDetail />} />

                {/* Usuarios */}
                <Route path="/users" element={<UsersList />} />
                <Route path="/users/new" element={<CreateUserForm />} />
                <Route path="/users/edit/:id?" element={<EditUserForm />} />
                <Route path="/users/password-update" element={<PasswordUpdate />} />

                {/* Parámetros */}
                <Route path="/parameters" element={<GeneralParameters />} />

                {/* WebSocket Test */}
                <Route path="/websocket-test" element={<WebSocketTestPage />} />
              </Route>

              {/* Layout Producción */}
              <Route path="/production" element={<ProductionLayout />}>
                <Route path="" element={<JobsContainer />} />
                <Route path="detailed-job/:id" element={<DetailedJobContainer />} />
                {/* otras rutas de producción */}
              </Route>
            </Routes>
          ) : (
            <LoginForm />
          )}
        </>
      )}
    </>
  );
}

export default App;
