import React from 'react';
import './TextButton.css';

const TextButton = ({ text, onClick, disabled = false }) => {
    return (
        <button className='text-button' onClick={onClick} disabled={disabled}>
            {text}
        </button>
    );
};

export default TextButton;
