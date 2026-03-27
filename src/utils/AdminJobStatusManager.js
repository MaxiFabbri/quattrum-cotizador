function sellingInvoiceRulesForNewJobs(invoice) {
    const updated = { ...invoice };
    if (updated.invoiceType !== "Anticipado") {
        updated.isPendingIssuance = false;
        updated.hasCollectionsPending = false;
        return updated;
    } else if (updated.invoiceNumber === '' || updated.invoiceNumber === null) {
        updated.isPendingIssuance = true;
    } else {
        updated.isPendingIssuance = false;
    }
    if (updated.collections.some(collection =>
        (collection.collectionDate == null ||
        collection.collectionDate === "") && collection.collectionType !== "Saldo"
    )) {
        updated.hasCollectionsPending = true;
    } else {
        updated.hasCollectionsPending = false;
    }
    return updated;
}
function sellingInvoicesRulesForReadyJobs(invoice) {
    const updated = { ...invoice };
    if (updated.invoiceNumber === '' || updated.invoiceNumber == null) {
        updated.isPendingIssuance = true;
    } else {
        updated.isPendingIssuance = false;
    }
    if (updated.collections.some(collection =>
        collection.collectionDate == null ||
        collection.collectionDate === ""
    )) {
        updated.hasCollectionsPending = true;
    } else {
        updated.hasCollectionsPending = false;
    }
    return updated;
}
function buyingInvoiceRulesForNewProcesses(invoice) {
    const updated = { ...invoice };
    if (updated.invoiceType !== "Anticipado") {
        updated.isInvoicePendingReception = false;
        updated.hasPaymentsPending = false;
        return updated;
    } else if (updated.invoiceNumber === '' || updated.invoiceNumber === null) {
        updated.isInvoicePendingReception = true;
    } else {
        updated.isInvoicePendingReception = false;
    }

    if (updated.payments.some(payment =>
        (payment.paymentDate == null ||
        payment.paymentDate === "") && payment.paymentType !== "Saldo"
    )) {
        updated.hasPaymentsPending = true;
    } else {
        updated.hasPaymentsPending = false;
    }
    return updated;
}
function buyingInvoiceRulesForReadyProcesses(invoice) {
    const updated = { ...invoice };
    if (updated.invoiceNumber === '' || updated.invoiceNumber == null) {
        updated.isInvoicePendingReception = true;
    } else {
        updated.isInvoicePendingReception = false;
    }
    if (updated.payments.some(payment =>
        payment.paymentDate == null ||
        payment.paymentDate === ""
    )) {
        updated.hasPaymentsPending = true;
    } else {
        updated.hasPaymentsPending = false;
    }
    return updated;
}

const leastAdvancedStatus = (job) => {
    if(job.jobStatus === "Nuevo" || job.jobStatus === "Cerrado" || job.jobStatus === "Anulado") {
        return job.jobStatus;
    }
    const statusOrder = [
        "En Preparación",
        "En Producción",
        "Listo",
        "Entregado"
    ];

    // Obtenemos los estados de los jobProducts
    const productStatuses = job.jobProducts.map(p => p.jobProductStatus);

    // Si no hay jobProducts, devolvemos el status actual del job
    if (productStatuses.length === 0) {
        return job.jobStatus;
    }

    // Encontramos el menos avanzado
    const leastAdvanced = productStatuses.reduce((current, next) => {
        return statusOrder.indexOf(next) < statusOrder.indexOf(current) ? next : current;
    });

    return leastAdvanced;
};

export function calculateInvoicesStatus(invoices, jobStatus) {
    console.log("Calculando Invoices Status: ", invoices, " - JobStatus: ", jobStatus)
    let updatedInvoices = [];
    if (["Nuevo", "En Preparación", "En Producción"].includes(jobStatus)) {
        updatedInvoices = invoices.map(sellingInvoiceRulesForNewJobs)
    } else {
        updatedInvoices = invoices.map(sellingInvoicesRulesForReadyJobs)
    }
    return updatedInvoices
}
export function calculateProcessInvoicesStatus(invoices, jobProductStatus) {
    let updatedInvoices = [];
    if (["En Preparación", "En Producción"].includes(jobProductStatus)) {
        updatedInvoices = invoices.map(buyingInvoiceRulesForNewProcesses)
    } else {
        updatedInvoices = invoices.map(buyingInvoiceRulesForReadyProcesses)
    }
    return updatedInvoices
}

export function calculateJobStatus(jobData) {
    const salesInvoices = jobData.invoices || [];
    const processesInvoices = jobData.jobProducts.flatMap(product =>
        product.processes.flatMap(process => process.invoices)
    );
    const jobStatus = leastAdvancedStatus(jobData);
    const updatedData = {
        jobStatus,
        hasInvoicesPendingIssuance: salesInvoices.some(invoice => invoice.isPendingIssuance),
        hasCollectionsPending: salesInvoices.some(invoice => invoice.hasCollectionsPending),
        hasPurchaseInvocesToRecieve: processesInvoices.some(invoice => invoice.isInvoicePendingReception),
        hasPaymentsToMake: processesInvoices.some(invoice => invoice.hasPaymentsPending)
    };
    return updatedData;
}