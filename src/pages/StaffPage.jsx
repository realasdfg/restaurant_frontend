import React, {useEffect, useState} from 'react';
import {fetchOrders, fetchTables} from '../services/api';
import {Table, Tag, Typography} from 'antd';
import LoadingSpinner from "../components/shared/LoadingSpinner.jsx";
import SHeader from "../components/shared/SHeader.jsx";

const {Title} = Typography;

const StaffPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tableMap, setTableMap] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersResponse, tablesResponse] = await Promise.all([
                    fetchOrders(true),
                    fetchTables(),
                ]);

                setOrders(ordersResponse.data);

                const tableMapData = {};
                tablesResponse.data.forEach((table) => {
                    tableMapData[table.id] = table.name;
                });

                setTableMap(tableMapData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <LoadingSpinner/>
        );
    }

    const calculateMinutesAgo = (createdAt) => {
        const now = new Date();
        const createdTime = new Date(createdAt);
        const differenceInMs = now - createdTime;
        const differenceInMinutes = Math.floor(differenceInMs / (1000 * 60));
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
            render: (tableId) => tableId > 0 ? tableMap[tableId] || `Стіл ${tableId}` : '-',
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
            <SHeader/>
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
