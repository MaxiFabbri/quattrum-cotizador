import { useState, useContext } from "react";
import "./JobAdminFilterMenu.css";
import { JobContext } from "../../context/JobContext";


const JobAdminFilterMenu = ({ onComplete }) => {
  const { setJobAdminFilter } = useContext(JobContext);

  const options = [
    "Todos",
    "Facturas de Venta pendientes de emitir",
    "Cobranzas Reclamables Pendientes",
    "Facturas de Compra pendientes de reclamar",
    "Pagos pendientes de hacer",
  ];

  const optionMap = {
    "Facturas de Venta pendientes de emitir": "hasInvoicesPendingIssuance",
    "Cobranzas Reclamables Pendientes": "hasCollectionsPending",
    "Facturas de Compra pendientes de reclamar": "hasPurchaseInvocesToRecieve",
    "Pagos pendientes de hacer": "hasPaymentsToMake",
  };

  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState(["Todos"]);

  const handleChange = (option) => {
    if (option === "Todos") {
      // Si elijo "Todos", borro todo lo demás
      setSelectedOptions(["Todos"]);
    } else {
      // Si elijo otro, saco "Todos"
      const newSelection = selectedOptions.includes(option)
        ? selectedOptions.filter((o) => o !== option)
        : [...selectedOptions.filter((o) => o !== "Todos"), option];

      setSelectedOptions(newSelection.length > 0 ? newSelection : ["Todos"]);
    }
  };

  const handleComplete = () => {
    const mapped = selectedOptions.includes("Todos")
      ? []
      : selectedOptions.map((opt) => optionMap[opt]);

    onComplete(mapped);
    setOpen(false);
  };


  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button onClick={() => setOpen(!open)}>Abrir Filtros</button>

      {open && (
        <div className="filter-menu">
          {options.map((opt) => (
            <div key={opt} style={{ marginBottom: "4px" }}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(opt)}
                  onChange={() => handleChange(opt)}
                />
                {opt}
              </label>
            </div>
          ))}

          <button onClick={handleComplete}>
            Completado
          </button>
        </div>
      )}
    </div>
  );
};

export default JobAdminFilterMenu;