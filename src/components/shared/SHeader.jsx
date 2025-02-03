import React from 'react';
import {useNavigate} from 'react-router-dom';
import {Header} from 'antd/es/layout/layout.js';
import {Button} from 'antd';
import CreateOrderDropdown from "../Staff/CreateOrderDropdown.jsx";

const SHeader = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/staff/login');
    };

    const handleOrdersClick = () => {
        navigate('/orders');
    };

    return (
        <Header className="flex justify-between items-center bg-blue-500 pe-4 ps-4">
            <div>
                <Button color="primary" variant="outlined" onClick={handleOrdersClick}>
                    Zamówienia
                </Button>
                <CreateOrderDropdown/>
            </div>
            <Button color="danger" variant="solid" onClick={handleLogout}>
                Wyloguj się
            </Button>
        </Header>
    );
};

export default SHeader;
