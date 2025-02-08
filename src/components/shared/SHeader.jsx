import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Header} from 'antd/es/layout/layout.js';
import {Button, Drawer} from 'antd';
import CreateOrderDropdown from "../Staff/CreateOrderDropdown.jsx";
import {HomeOutlined, UserOutlined} from "@ant-design/icons";
import {useAuth} from "../../context/AuthContext.jsx";
import {fetchUserById} from "../../services/api.js";

const SHeader = ({isAdminPage}) => {
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [user, setUser] = useState(false);
    const {userRole, setUserRole} = useAuth();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userResponse = await Promise.race([fetchUserById('me')]);
                setUser(userResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchUserData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUserRole('guest')
        navigate('/staff/login');
    };

    const handleHomeClick = () => {
        if (isAdminPage) {
            navigate('/admin/orders');
        } else {
            navigate('/orders');
        }
    };

    return (
        <Header className="flex justify-between items-center bg-blue-500 pe-4 ps-4">
            <div className="flex items-center gap-1">
                <Button color="primary" variant="outlined" onClick={handleHomeClick}>
                    <HomeOutlined/>
                </Button>
                {isAdminPage ? (
                    <div className="text-white text-xl">Strona Administratora</div>
                ) : (
                    <CreateOrderDropdown/>
                )}
            </div>
            <UserOutlined className="text-white text-xl" onClick={() => setIsDrawerOpen(true)}/>

            <Drawer
                title={<>{user.first_name} {user.last_name} ({userRole === 'staff' ? 'Kelner' : 'Administrator'})</>}
                placement="right"
                open={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                styles={{
                    body: {backgroundColor: "rgb(243, 244, 246)"},
                    header: {backgroundColor: "rgb(249, 250, 251)"}
                }}
            >
                <div className="flex flex-col gap-3">
                    {userRole === "admin" &&
                        <>
                            <Button className="w-full size-9" color="blue" variant="solid"
                                    onClick={() => {
                                        setIsDrawerOpen(false);
                                        navigate('/orders');
                                    }}>
                                Aktualne zamówienia
                            </Button>
                            <Button className="w-full size-9" color="blue" variant="solid"
                                    onClick={() => {
                                        setIsDrawerOpen(false);
                                        navigate('/admin/orders');
                                    }}>
                                Archiwum zamówień
                            </Button>
                        </>
                    }
                    <Button className="w-full" color="danger" variant="solid" onClick={handleLogout}>
                        Wyloguj się
                    </Button>
                </div>
            </Drawer>
        </Header>
    );
};

export default SHeader;
