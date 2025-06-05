import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"
import TextButton from "../Utils/TextButton.jsx";
import SelectCustomerPayMethod from "../Utils/Selectors/SelectCustomerPaymentMethod.jsx";
import { apiClient } from "../../config/axiosConfig.js";
import "./EditCustomer.css";


const EditCustomer = () => {
    const navigate = useNavigate();
    const [newCustomerData, setNewCustomerData] = useState({});
    const [loading, setLoading] = useState(true);

    const { id } = useParams()
    // console.log("id: ", id);

    const fetchCustomerData = async () => {
        try {
            const response = await apiClient.get(`/customers/${id}`);
            setNewCustomerData(response.data.response); // Asigna el objeto de la respuesta
            console.log("newCustomerData: ", response.data.response)
        } catch (error) {
            console.error("Error al cargar el cliente:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id !== "new") {
            fetchCustomerData();
        } else {
            setLoading(false);
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log("update customerData: ", name, value);
        setNewCustomerData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }
    const handleCustomerPaymentMethodUpdate = async (customerPaymentMethod) => {
        console.log("Customerer Payment Method en handle supplier payment method update: ", customerPaymentMethod);
        const updatedData = {
            ...newCustomerData,
            customerPaymentMethodId: customerPaymentMethod._id || "",
            paymentMethodName: customerPaymentMethod.customer_payment_description || "",
            paymentDaysToCollect: customerPaymentMethod.days_to_collect || 0,
        }
        setNewCustomerData(updatedData);
    }
    const handleCancel = () => {
        navigate("/customers"); // Redirige a la lista de clientes después de guardar
    }

    const saveNewCustomer = async () => {
        const data = {
            name: newCustomerData.name,
            code: newCustomerData.code || "",
            cuit: newCustomerData.cuit || "",
            email: newCustomerData.email || "",
            customerPaymentMethodId: newCustomerData.customerPaymentMethodId,
        }
        try {
            const response = await apiClient.post("/customers", data);
            if (response.data.response) {
                alert("Cliente guardado exitosamente");
            }
        } catch (error) {
            console.error("Error al guardar el cliente:", error);
            alert("Error al guardar el cliente. Por favor, inténtalo de nuevo.");
            return; // Si hay un error, no continuar
        }
    }
    const updateCustomer = async () => {
        try {
            const response = await apiClient.put(`/customers/${id}`, newCustomerData);
        } catch (error) {
            console.error("Error al actualizar el cliente:", error);
            alert("Error al actualizar el cliente. Por favor, inténtalo de nuevo.");
            return; // Si hay un error, no continuar
        }
    }

    const handleSaveCustomer = async () => {
        if (!validateCustomerData()) {
            return; // Si la validación falla, no continuar
        } else if (id === "new") {
            const customerCheck = await checkIfCustomerExists(newCustomerData.name)
            if (customerCheck) {
                alert("El cliente ya existe. Por favor, elige otro nombre.");
                return; // Si el cliente ya existe, no continuar
            } else {
                await saveNewCustomer()
            }
        } else {
            await updateCustomer()
        }
        navigate("/customers"); // Redirige a la lista de clientes después de guardar
    }

    const checkIfCustomerExists = async (name) => {
        const response = await apiClient.get(`/customers/name/${name}`);
        return response.data.response
    }

    const validateCustomerData = () => {
        const { name, customerPaymentMethodId } = newCustomerData;
        if (!name || name.trim() === "") {
            alert("El nombre del cliente es obligatorio.");
            return false;
        } else if (name.length < 3) {
            alert("El nombre del cliente debe tener al menos 3 caracteres.");
            return false;
        } else if (!customerPaymentMethodId) {
            alert("El método de pago del cliente es obligatorio.");
            return false;
        }
        return true;
    }


    useEffect(() => {
        console.log("id: ", id);
        console.log("new customer Data: ", newCustomerData)
    }, [newCustomerData]);

    return (
        <>
            {loading ?
                <p>Cargando...</p>
                :
                <div className="detailedCustomer">
                    <h2>Cliente</h2>
                    <div className="customerData">
                        <div className="customerInfo">
                            <p>
                                <span>Nombre: </span>
                                <input
                                    className="input"
                                    type="text"
                                    name="name"
                                    placeholder="Nombre del cliente"
                                    defaultValue={newCustomerData.name}
                                    onInput={handleInputChange}
                                />
                            </p>
                            <p>
                                <span>Código: </span>
                                <input
                                    className="input"
                                    type="text"
                                    name="code"
                                    placeholder="Código"
                                    defaultValue={newCustomerData.code}
                                    onInput={handleInputChange}
                                />
                            </p>
                            <p>
                                <span>CUIT: </span>
                                <input
                                    className="input"
                                    type="text"
                                    name="cuit"
                                    placeholder="CUIT del cliente ej.(20-12345678-1)"
                                    defaultValue={newCustomerData.cuit}
                                    onInput={handleInputChange}
                                />
                            </p>
                            <p>
                                <span>Email: </span>
                                <input
                                    type="text"
                                    name="email"
                                    placeholder="Email del cliente"
                                    defaultValue={newCustomerData.email}
                                    onInput={handleInputChange}
                                />
                            </p>
                            <div>
                                <span>Método de pago: </span>
                                <SelectCustomerPayMethod
                                    defaultCustomerPay={newCustomerData.customerPaymentMethodId?.customer_payment_description}
                                    onSelectCustomerPayMethod={handleCustomerPaymentMethodUpdate}
                                />
                            </div>

                        </div>
                        <div className="customerActions">
                            <TextButton text="Guardar" onClick={handleSaveCustomer} />
                            <TextButton text="Cancelar" onClick={handleCancel} />
                        </div>
                    </div>
                </div>
            }
        </>
    );
}

export default EditCustomer;