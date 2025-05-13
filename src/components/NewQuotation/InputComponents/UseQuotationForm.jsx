import { useState } from 'react';

const UseQuotationForm = (initialState) => {
    const [formData, setFormData] = useState(initialState);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    };
    return {
        formData,
        setFormData,
        handleInputChange
    };
};

export default UseQuotationForm;