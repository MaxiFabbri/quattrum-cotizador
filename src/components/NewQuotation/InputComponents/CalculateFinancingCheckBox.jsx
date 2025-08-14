const CalculateFinancingCheckbox = ({ checked, onChange }) => {
    return (
        <input
            type="checkbox"
            id="calculateFinancing"
            name="calculateFinancing"
            checked={checked}
            onChange={onChange}
        />
    );
};

export default CalculateFinancingCheckbox;