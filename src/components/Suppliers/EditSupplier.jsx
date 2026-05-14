import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"
import TextButton from "../Utils/TextButton.jsx";
import SelectSupplierPayMethod from "../Utils/Selectors/SelectSupplierPaymentMethod.jsx";
import { apiClient } from "../../config/axiosConfig.js";
import ContanctTableItem from "../Customers/ContactTableItem.jsx";
import IconButton from "../Utils/IconButton.jsx";
import { v4 as uuidv4 } from 'uuid';
import "./EditSupplier.css";


const EditSupplier = () => {
    const navigate = useNavigate();
    const [newSupplierData, setNewSupplierData] = useState({});
    const [loading, setLoading] = useState(true);

    const { id } = useParams()

    const fetchSupplierData = async () => {
        try {
            const response = await apiClient.get(`/suppliers/${id}`);
            console.log("Datos del proveedor obtenidos:", response.data.response);
            setNewSupplierData(response.data.response); // Asigna el objeto de la respuesta
        } catch (error) {
            console.error("Error al cargar el proveedor:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id !== "new") {
            fetchSupplierData();
        } else {
            setLoading(false);
            setNewSupplierData({
                name: "",
                code: "",
                cuit: "",
                email: "",
                phone: "",
                supplierPaymentMethodId: "",
                supplierNote: "",
                supplierContact: [],
            });
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSupplierData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }
    const handleSupplierPaymentMethodUpdate = async (supplierPaymentMethod) => {

        const updatedData = {
            ...newSupplierData,
            supplierPaymentMethodId: supplierPaymentMethod._id || "",
            paymentMethodName: supplierPaymentMethod.supplier_payment_description || "",
            paymentDaysToCollect: supplierPaymentMethod.days_to_payment || 0,
        }
        setNewSupplierData(updatedData);
    }
    const handleCancel = () => {
        navigate("/suppliers"); // Redirige a la lista de proveedores después de guardar
    }

    const saveNewSupplier = async () => {
        const data = {
            name: newSupplierData.name,
            code: newSupplierData.code || "",
            cuit: newSupplierData.cuit || "",
            phone: newSupplierData.phone || "",
            email: newSupplierData.email || "",
            supplierPaymentMethodId: newSupplierData.supplierPaymentMethodId,
            supplierNote: newSupplierData.supplierNote || "",
            supplierContact: newSupplierData.supplierContact || [],
        }
        try {
            const response = await apiClient.post("/suppliers", data);
            if (response.data.response) {
                alert("Proveedor guardado exitosamente");
            }
        } catch (error) {
            console.error("Error al guardar el proveedor", error);
            alert("Error al guardar el proveedor. Por favor, inténtalo de nuevo.");
            return; // Si hay un error, no continuar
        }
    }
    const updateSupplier = async () => {
        console.log("Actualizando proveedor con datos:", newSupplierData);
        try {
            const response = await apiClient.put(`/suppliers/${id}`, newSupplierData);
        } catch (error) {
            console.error("Error al actualizar el proveedor:", error);
            alert("Error al actualizar el proveedor. Por favor, inténtalo de nuevo.");
            return; // Si hay un error, no continuar
        }
    }

    const handleSaveSupplier = async () => {
        if (!validateSupplierData()) {
            return; // Si la validación falla, no continuar
        } else if (id === "new") {
            const supplierCheck = await checkIfSupplierExists(newSupplierData.name)
            if (supplierCheck) {
                alert("El proveedor ya existe. Por favor, elige otro nombre.");
                return; // Si el proveedor ya existe, no continuar
            } else {
                await saveNewSupplier()
            }
        } else {
            await updateSupplier()
        }
        navigate("/suppliers"); // Redirige a la lista de clientes después de guardar
    }

    const checkIfSupplierExists = async (name) => {
        const response = await apiClient.get(`/suppliers/name/${name}`);
        return response.data.response
    }

    const validateSupplierData = () => {
        const { name, supplierPaymentMethodId } = newSupplierData;
        if (!name || name.trim() === "") {
            alert("El nombre del proveedor es obligatorio.");
            return false;
        } else if (name.length < 3) {
            alert("El nombre del proveedor debe tener al menos 3 caracteres.");
            return false;
        } else if (!supplierPaymentMethodId) {
            alert("El método de pago del proveedor es obligatorio.");
            return false;
        }
        return true;
    }


    const handleAddItem = () => {
        setNewSupplierData((prevData) => ({
            ...prevData,
            supplierContact: [...((prevData.supplierContact) || []),
            {
                id: uuidv4(),
                name: "",
                position: "",
                email: "",
                phone: ""
            }
            ]
        }));
    }
    const handleDelete = (id) => {
        console.log("Eliminar Item ", id);
        const updatedTable = (newSupplierData.supplierContact || []).filter(item => item.id !== id);
        setNewSupplierData((prevData) => ({
            ...prevData,
            supplierContact: updatedTable
        }));
    };
    const handleChange = (e, itemId) => {
        const { name, value } = e.target;
        const updatedTable = newSupplierData.supplierContact.map(item =>
            item.id === itemId ? { ...item, [name]: value } : item
        );
        setNewSupplierData((prevData) => ({
            ...prevData,
            supplierContact: updatedTable
        }));
    }

    return (
        <>
            {loading ?
                <p>Cargando...</p>
                :
                <div className="detailedSupplier">
                    <h2>Proveedor</h2>
                    <div className="supplierData">
                        <div className="supplierInfo">
                            <p>
                                <span>Nombre: </span>
                                <input
                                    className="input"
                                    type="text"
                                    name="name"
                                    placeholder="Nombre del proveedor"
                                    defaultValue={newSupplierData.name}
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
                                    defaultValue={newSupplierData.code}
                                    onInput={handleInputChange}
                                />
                            </p>
                            <p>
                                <span>CUIT: </span>
                                <input
                                    className="input"
                                    type="text"
                                    name="cuit"
                                    placeholder="CUIT del Proveedor ej.(20-12345678-1)"
                                    defaultValue={newSupplierData.cuit}
                                    onInput={handleInputChange}
                                />
                            </p>
                            <p>
                                <span>Teléfono: </span>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Teléfono del proveedor"
                                    defaultValue={newSupplierData.phone}
                                    onInput={handleInputChange}
                                />
                            </p>
                            <p>
                                <span>Email: </span>
                                <input
                                    type="text"
                                    name="email"
                                    placeholder="Email del proveedor"
                                    defaultValue={newSupplierData.email}
                                    onInput={handleInputChange}
                                />
                            </p>
                            <div>
                                <span>Método de pago: </span>
                                <SelectSupplierPayMethod
                                    defaultSupplierPay={newSupplierData.supplierPaymentMethodId?.supplier_payment_description}
                                    onSelectSupplierPayMethod={handleSupplierPaymentMethodUpdate}
                                />
                            </div>


                            <div className="contacts-table-border">
                                <table className="contacts-table">
                                    <thead>
                                        <tr>
                                            <th colSpan="6" className="contacts-table-title">Contactos</th>
                                        </tr>
                                        <tr>
                                            <th className="contacts-table-th" style={{ width: "50px" }}> </th>
                                            <th className="contacts-table-th" style={{ width: "150px" }}>Nombre</th>
                                            <th className="contacts-table-th" style={{ width: "150px" }}>Cargo</th>
                                            <th className="contacts-table-th" style={{ width: "150px" }}>Mail</th>
                                            <th className="contacts-table-th" style={{ width: "150px" }}>Telefono</th>
                                            <th className="contacts-table-th" style={{ width: "50px" }}>
                                                <IconButton
                                                    icon="/images/create.png"
                                                    title="Agregar Item"
                                                    onClick={() => handleAddItem()}
                                                />
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {newSupplierData.supplierContact.map((item) => (
                                            <ContanctTableItem
                                                key={item.id}
                                                item={item}
                                                handleDelete={handleDelete}
                                                handleChange={(e) => handleChange(e, item.id)}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>


                            <p>
                                <span>Nota</span>
                                <textarea
                                    name="supplierNote"
                                    placeholder="Notas adicionales..."
                                    defaultValue={newSupplierData.supplierNote}
                                    onInput={handleInputChange}
                                />
                            </p>
                        </div>
                        <div className="supplierActions">
                            <TextButton text="Guardar" onClick={handleSaveSupplier} />
                            <TextButton text="Cancelar" onClick={handleCancel} />
                        </div>
                    </div>
                </div>
            }
        </>
    );
}

export default EditSupplier;