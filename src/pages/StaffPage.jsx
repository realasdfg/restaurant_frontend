import React, {useEffect, useState} from 'react';
import API from '../services/api';
import {Table, Tag, Typography} from 'antd';
import LoadingSpinner from "../components/shared/LoadingSpinner.jsx";
import SHeader from "../components/shared/SHeader.jsx";

const {Title} = Typography;

const StaffPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await API.get('/orders', {
                    params: {current_only: true},
                });
                setOrders(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <LoadingSpinner/>
        );
    }

    const calculateMinutesAgo = (createdAt) => {
        const now = new Date();
        const createdTime = new Date(createdAt);
        const differenceInMs = now - createdTime; // Різниця в мілісекундах
        const differenceInMinutes = Math.floor(differenceInMs / (1000 * 60)); // Перетворюємо в хвилини
        return differenceInMinutes > 120 ? '120+' : `${differenceInMinutes}`;
    };

    const columns = [
        {
            title: <div className="text-center">Typ</div>,
            dataIndex: 'type',
            key: 'type',
            className: 'text-center ',
            render: (type) => (
                <Tag color={type === 'dinein' ? 'green' : 'blue'}>{type.toUpperCase()}</Tag>
            ),
        },
        {
            title: <div className="text-center">Stolik</div>,
            dataIndex: 'table_id',
            key: 'table_id',
            className: 'text-center ',
            render: (tableId) => (tableId > 0 ? `${tableId}` : '-'),
        },
        {
            title: <div className="text-center">Utworzono</div>,
            dataIndex: 'created_at',
            key: 'created_at',
            className: 'text-center ',
            render: (date) => calculateMinutesAgo(date) + ' min',
        },
    ];

    return (
        <div className="bg-gray-200 font-mono min-h-screen">
            <SHeader />
            <div className="flex justify-center min-h-screen">
                <div className="bg-gray-100 p-4 rounded-lg shadow w-full lg:w-4/5 xl:w-4/5">
                    <Title level={2} className="text-center">
                        Aktualne zamówienia
                    </Title>
                    <Table
                        className="bg-gray-100"
                        dataSource={orders}
                        columns={columns}
                        rowKey={(record) => record.id}
                        pagination={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default StaffPage;
