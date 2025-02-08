import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Header} from 'antd/es/layout/layout.js';
import {Button, Drawer} from 'antd';
import CreateOrderDropdown from "../Staff/CreateOrderDropdown.jsx";
import {UserOutlined} from "@ant-design/icons";
import {useAuth} from "../../context/AuthContext.jsx";

const SHeader = () => {
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const {user} = useAuth();

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
            <UserOutlined className="text-white text-xl" onClick={() => setIsDrawerOpen(true)}/>
            <Drawer
                title="Użytkownik"
                placement="right"
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                styles={{
                    body: {backgroundColor: "rgb(243, 244, 246)"},
                    header: {backgroundColor: "rgb(249, 250, 251)"}
                }}
            >
                {user === "admin" &&
                    <div>
                        aboba
                    </div>
                }
                <Button className="w-full" color="danger" variant="solid" onClick={handleLogout}>
                    Wyloguj się
                </Button>
            </Drawer>
        </Header>
    );
};

export default SHeader;
