import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Tag, Typography, Tabs} from "antd";
import {fetchOrders, fetchTables} from "../../services/api";
import LoadingSpinner from "../shared/LoadingSpinner";
import OrdersTable from "./OrdersTable.jsx";
import OrderActionsDropdown from "./OrderActionsDropdown.jsx";
import {orderWebSocketService} from "../../services/websocketService.js";

const {Title} = Typography;

const CurrentOrders = () => {
    const [orders, setOrders] = useState([]);
    const [tableMap, setTableMap] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [_, setTimeUpdated] = useState(Date.now());

    useEffect(() => {
        const access_token = localStorage.getItem("access_token");
        orderWebSocketService.connect(access_token);

        const unsubscribe = orderWebSocketService.subscribe((order) => {
            console.log('New order received', order);

            setOrders((prevOrders) => {
                if (order.paid) {
                    return prevOrders.filter(o => o.id !== order.id);
                }

                const orderIndex = prevOrders.findIndex(o => o.id === order.id);

                if (orderIndex !== -1) {
                    return prevOrders.map(o => (o.id === order.id ? order : o));
                } else {
                    return [order, ...prevOrders];
                }
            });
        });

        return () => {
            unsubscribe();
            orderWebSocketService.close();
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersResponse, tablesResponse] = await Promise.all([
                    fetchOrders({paid: false}),
                    fetchTables(),
                ]);
                setOrders(ordersResponse.data);

                const tableMapData = {};
                tablesResponse.data.forEach((table) => {
                    tableMapData[table.id] = table.name;
                });

                setTableMap(tableMapData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeUpdated(Date.now());
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const calculateMinutesAgo = (createdAt) => {
        const now = new Date();
        const createdTime = new Date(createdAt);
        const differenceInMinutes = Math.floor((now - createdTime) / (1000 * 60));
        return differenceInMinutes > 120 ? "120+" : `${differenceInMinutes}`;
    };

    const handleOrderUpdate = (orderId, data) => {
        setOrders((prevOrders) =>
            prevOrders.map((order) => (order.id === orderId ? {...order, ...data} : order))
        );
    };

    const columns = [
        {
            title: "#",
            dataIndex: "id",
            key: "id",
            className: "w-1 bg-white",
            sorter: (a, b) => a.id - b.id,
            render: (id) => <div className="font-semibold">{id}</div>,
        },
        {
            title: "Typ",
            dataIndex: "type",
            key: "type",
            className: "w-1/3 bg-white",
            render: (type) => (
                <Tag color={type === "dinein" ? "green" : "blue"}>
                    {type === "dinein" ? "DINE IN" : "TO GO"}
                </Tag>
            ),
        },
        {
            title: "Table",
            dataIndex: "table_id",
            key: "table_id",
            className: "w-1/3 bg-white",
            sorter: (a, b) => {
                const nameA = tableMap[a.table_id] || "";
                const nameB = tableMap[b.table_id] || "";
                return nameA.localeCompare(nameB, undefined, {numeric: true});
            },
            render: (tableId) => (tableId ? tableMap[tableId] : "-"),
        },
        {
            title: "Created at",
            dataIndex: "created_at",
            key: "created_at",
            className: "w-1/3 bg-white",
            render: (date) => calculateMinutesAgo(date) + " min",
        },
        {
            key: "dropdown",
            className: "w-1 bg-white",
            render: (_, record) => (
                <OrderActionsDropdown order={record} onUpdateOrder={handleOrderUpdate} iconClassName="text-black"/>
            ),
        },
    ];

    const handleRowClick = (record) => ({
        onClick: () => navigate(`/staff/orders/${record.id}`),
        style: {cursor: "pointer"},
    });

    const tabs = [
        {
            key: "1",
            label: "All",
            children: <div className="overflow-x-auto">
                <OrdersTable columns={columns} dataSource={orders} onRow={handleRowClick} pagination={false}/>
            </div>,
        },
        {
            key: "2",
            label: "Dine in",
            children: <div className="overflow-x-auto">
                <OrdersTable columns={columns} dataSource={orders.filter(o => o.type === "dinein")}
                             onRow={handleRowClick} pagination={false}/>
            </div>,
        },
        {
            key: "3",
            label: "To go",
            children: <div className="overflow-x-auto">
                <OrdersTable columns={columns} dataSource={orders.filter(o => o.type === "togo")}
                             onRow={handleRowClick} pagination={false}/>
            </div>,
        },
    ];

    if (loading) return <LoadingSpinner/>;

    return (
        <div className="flex justify-center mb-4 my-3 mx-1 min-h-screen">
            <div className="bg-gray-100 rounded-lg shadow w-full lg:w-3/5 flex flex-col gap-3 pb-4">
                <Title level={2} className="text-center mt-3">Current Orders</Title>
                <div className="mx-1">
                    <Tabs defaultActiveKey="1" items={tabs}/>
                </div>
            </div>
        </div>
    );
};

export default CurrentOrders;
