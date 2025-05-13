import React from 'react';
import './IconButton.css';

const IconButton = ({ icon, text, onClick }) => {
    return (
        <button className='icon-button' onClick={onClick}>
            <img src={icon} alt={text}  />
        </button>
    );
};

export default IconButton;