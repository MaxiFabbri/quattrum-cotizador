function sellingInvoiceRulesForNewJobs(invoice) {
    console.log("Calculando Selling Invoice Rules For New Jobs: ", invoice)
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
    const collectionsPending = updated.collections.some(collection =>
        (collection.collectionDate == null ||
        collection.collectionDate === "") && collection.collectionType !== "Saldo"
    );
    if (collectionsPending) {
        updated.hasCollectionsPending = true;
    } else {
        updated.hasCollectionsPending = false;
    }
    console.log("Updated Selling Invoice: ", updated)
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
    
    const processesInvoices = jobData.jobProducts.flatMap(product =>
        product.processes?.flatMap(process => process.invoices) || []
    );
    const noProcesses = jobData.jobProducts.every(product => !product.processes || product.processes.length === 0);
    const jobStatus = leastAdvancedStatus(jobData);

    const salesInvoices = calculateInvoicesStatus(jobData.invoices, jobStatus);

    const updatedData = {
        jobStatus,
        invoices: salesInvoices,
        hasInvoicesPendingIssuance: noProcesses ? true : salesInvoices.some(invoice => invoice.isPendingIssuance),
        hasCollectionsPending: noProcesses ? true : salesInvoices.some(invoice => invoice.hasCollectionsPending),
        hasPurchaseInvocesToRecieve: noProcesses ? true : processesInvoices.some(invoice => invoice.isInvoicePendingReception),
        hasPaymentsToMake: noProcesses ? true : processesInvoices.some(invoice => invoice.hasPaymentsPending)
    };
    console.log("Updated Job Data: ", updatedData)
    return updatedData;
}