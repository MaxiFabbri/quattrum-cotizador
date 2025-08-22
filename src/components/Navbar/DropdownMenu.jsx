import Dropdown from 'rc-dropdown';
import 'rc-dropdown/assets/index.css';
import React from 'react';
import Menu, { Item as MenuItem } from 'rc-menu';
import { useNavigate } from 'react-router-dom';


const DropdownMenu = ({ user, role, onLogout }) => {
    const navigate = useNavigate();

    const menu = (
        <Menu>
            <MenuItem style={{ fontSize: '0.7em', fontWeight: '300' }} key="1" onClick={() => navigate('/users/password-update')}>Cambiar Contraseña</MenuItem>
            <MenuItem style={{ fontSize: '0.7em', fontWeight: '300' }} key="2" onClick={onLogout}>Cerrar Sesión</MenuItem>
        </Menu>
    );

    return (
        <Dropdown className='dropdown-item' overlay={menu} trigger={['click']}>
            <div style={{ cursor: 'pointer' }}>
                <h3>{user}</h3>
                <h6 style={{ fontSize: '0.8em', fontWeight: '400' }}>{role}</h6>
            </div>    
        </Dropdown>
    );
};

export default DropdownMenu;