import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Form, Input, Button, message} from 'antd';
import {login} from '../services/api.js';
import LoadingSpinner from "../components/shared/LoadingSpinner.jsx";
import {useAuth} from "../context/AuthContext.jsx";

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { userRole, setUserRole } = useAuth();

    useEffect(() => {
        if (userRole !== "guest") {
            navigate('/staff/orders');
        }
    }, [navigate]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await login(values.username, values.password);
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);

            message.success('Pomyślne logowanie!');
            setUserRole(response.data.role);
            navigate('/staff/orders');
        } catch (error) {
            if (error.response.status === 404) {
                message.error('Nieprawidłowy login lub hasło.');
            } else {
                message.error(error.response?.data?.detail)
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100 font-mono">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                <h2 className="text-2xl font-bold text-center mb-4">Autoryzacja</h2>
                <Form
                    name="login"
                    initialValues={{remember: true}}
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        label="Użytkownik"
                        name="username"
                        rules={[{required: true, message: "Wprowadź nazwę użytkownika!"}]}
                    >
                        <Input/>
                    </Form.Item>
                    <Form.Item
                        label="Hasło"
                        name="password"
                        rules={[{required: true, message: "Wprowadź hasło!"}]}
                    >
                        <Input.Password/>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
                            Zaloguj się
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default LoginPage;
