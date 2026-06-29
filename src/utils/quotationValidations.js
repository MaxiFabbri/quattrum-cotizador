export const validateQuotation = (quotation) => {
    const errors = [];

    function isValidMongoId(id) {
        return typeof id === "string" && /^[a-f\d]{24}$/i.test(id);
    }

    if (!quotation || !Array.isArray(quotation.products) || quotation.products.length === 0) {
        errors.push("La cotización debe tener al menos un producto.");
    }

    quotation.products?.forEach((product) => {
        if (typeof product.quantity !== "number" || product.quantity <= 0) {
            errors.push(`Producto ${product.productDescription} debe tener una Cantidad mayor que 0.`);
        }

        if (!Array.isArray(product.processes) || product.processes.length === 0) {
            errors.push(`Producto ${product.productDescription} debe tener al menos un proceso.`);
        }

        product.processes?.forEach((process) => {
            if (!isValidMongoId(process.supplierId)) {
                errors.push(`El Falta un proveedor para el procesos ${process.description} del producto ${product.productDescription}.`);
            }

        });
    });

    return {
        isValid: errors.length === 0,
        errors
    };
}

export const validateNewQuotation = (quotation) => {
    const errors = [];

    if (!quotation.customerId || quotation.customerId.trim() === "") {
        errors.push("Debe seleccionar un cliente para la cotización.");
    }

    if (!quotation.currency || quotation.currency.trim() === "") {
        errors.push("Debe seleccionar una moneda para la cotización.");
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}
