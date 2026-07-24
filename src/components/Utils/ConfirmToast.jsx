import React from "react";
import "./ConfirmToast.css";

const ConfirmToast = ({ message, onConfirm, onCancel, closeToast }) => {
    return (
        <div className="confirm-toast">
            <p className="confirm-toast__message">{message}</p>
            <div className="confirm-toast__buttons">
                <button
                    className="confirm-toast__button confirm-toast__button--yes"
                    onClick={() => { closeToast(); onConfirm(); }}
                >
                    Sí
                </button>
                <button
                    className="confirm-toast__button confirm-toast__button--no"
                    onClick={() => { closeToast(); onCancel(); }}
                >
                    No
                </button>
            </div>
        </div>
    );
};

export default ConfirmToast;
