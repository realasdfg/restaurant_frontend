import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Tag, Typography, Tabs} from 'antd';
import {fetchOrders, fetchTables} from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';
import OrdersTable from "./OrdersTable.jsx";

const {Title} = Typography;

const OrdersList = () => {
    const [orders, setOrders] = useState([]);
    const [tableMap, setTableMap] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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

    const calculateMinutesAgo = (createdAt) => {
        const now = new Date();
        const createdTime = new Date(createdAt);
        const differenceInMinutes = Math.floor((now - createdTime) / (1000 * 60));
        return differenceInMinutes > 120 ? '120+' : `${differenceInMinutes}`;
    };

    const getFilteredOrders = (type) => {
        if (!type) return orders;
        return orders.filter((order) => order.type === type);
    };

    const columns = [
        {
            title: 'Typ',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={type === 'dinein' ? 'green' : 'blue'}>{type === 'dinein' ? 'W RESTAURACJI' : 'NA WYNOS'}</Tag>
            ),
        },
        {
            title: 'Stolik',
            dataIndex: 'table_id',
            key: 'table_id',
            sorter: (a, b) => {
                const nameA = tableMap[a.table_id] || '';
                const nameB = tableMap[b.table_id] || '';
                return nameA.localeCompare(nameB, undefined, { numeric: true });
            },
            render: (tableId) => tableId ? tableMap[tableId]  : '-',
        },
        {
            title: 'Utworzono',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => calculateMinutesAgo(date) + ' min',
        },
    ];

    const handleRowClick = (record) => ({
        onClick: () => navigate(`/orders/${record.id}`),
        style: {cursor: 'pointer'},
    });

    const tabs = [
        {
            key: '1',
            label: 'Wszystkie',
            children: <OrdersTable columns={columns} dataSource={getFilteredOrders(null)} onRow={handleRowClick}/>,
        },
        {
            key: '2',
            label: 'W restauracji',
            children: <OrdersTable columns={columns} dataSource={getFilteredOrders('dinein')} onRow={handleRowClick}/>,
        },
        {
            key: '3',
            label: 'Na wynos',
            children: <OrdersTable columns={columns} dataSource={getFilteredOrders('togo')} onRow={handleRowClick}/>,
        },
    ];

    if (loading) return <LoadingSpinner/>;

    return (
        <div className="flex justify-center min-h-screen">
            <div className="bg-gray-100 p-4 m-2 rounded-lg shadow w-full lg:w-4/5 xl:w-4/5">
                <Title level={2} className="text-center">Aktualne zamówienia</Title>
                <Tabs defaultActiveKey="1" items={tabs}/>
            </div>
        </div>
    );
};

export default OrdersList;
