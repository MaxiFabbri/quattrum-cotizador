export function getInvoiceRowClass (invoice) {
    if (invoice.isPendingIssuance) {
        return "row-pending";
    } else if (invoice.hasCollectionsPending) {
        return "row-wip";
    } else  {
        return "row-valid";
    }
}

export function getProcessRowClass (invoice) {
    if (invoice.isInvoicePendingReception) {
        return "row-pending";
    } else if (invoice.hasPaymentsPending) {
        return "row-wip";
    } else  {
        return "row-valid";
    }
}