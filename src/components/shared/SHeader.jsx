import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from 'antd/es/layout/layout.js';
import { Button } from 'antd';

const SHeader = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        navigate('/staff/login');
    };

    return (
        <Header className="flex justify-end items-center bg-blue-500 rounded-t-lg pe-4">
            <Button type="primary" danger onClick={handleLogout}>
                Wyloguj się
            </Button>
        </Header>
    );
};

export default SHeader;
