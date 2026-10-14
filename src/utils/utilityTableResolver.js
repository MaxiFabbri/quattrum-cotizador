export const createUtilityTableResolver = (utilityTables = []) => (utilityTableId) => {
    const selectedTableId = utilityTableId && typeof utilityTableId === "object"
        ? utilityTableId._id || utilityTableId.id
        : utilityTableId;

    return utilityTables.find((table) => table._id === selectedTableId)
        || utilityTables.find((table) => table.isDefault)
        || utilityTables[0];
};
