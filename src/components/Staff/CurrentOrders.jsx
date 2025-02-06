import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Tag, Typography, Tabs, Dropdown, message, Modal, List, Button} from 'antd';
import {changeOrderInfo, fetchOrders, fetchTables} from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';
import CurrentOrdersTable from "./CurrentOrdersTable.jsx";
import {EllipsisOutlined} from "@ant-design/icons";

const {Title} = Typography;

const CurrentOrders = () => {
    const [orders, setOrders] = useState([]);
    const [tableMap, setTableMap] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [tables, setTables] = useState([]);


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

    const handleOrderInfoChange = async (orderId, data) => {
        try {
            console.log(orderId, data)
            await changeOrderInfo(orderId, data);

            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId ? {...order, ...data} : order
                )
            );
        } catch (error) {
            message.error("Błąd podczas zmiany typu zamówienia");
            console.error("Change order error:", error);
        }
    };

    const openTableModal = async (order) => {
        try {
            const response = await fetchTables();
            setTables(response.data.sort((a, b) => a.name.localeCompare(b.name)));
            setSelectedOrder(order);
            setIsTableModalOpen(true);
        } catch (error) {
            message.error("Nie udało się załadować stolików");
            console.error("Error fetching tables:", error);
        }
    };

    const handleTableSelect = async (table) => {
        if (!selectedOrder || !table.is_free) return;

        try {
            await handleOrderInfoChange(selectedOrder.id, { type: "dinein", table_id: table.id });
            setIsTableModalOpen(false);
        } catch (error) {
            message.error("Błąd podczas zmiany stolika");
        }
    };

    const handleMenuClick = async (e, order) => {
        e.domEvent.stopPropagation();

        if (e.key === "typeChange") {
            const newType = order.type === "dinein" ? "togo" : "dinein";
            if (newType === "dinein") {
                openTableModal(order);
            } else {
                await handleOrderInfoChange(order.id, { type: newType, table_id: null });
            }
        } else if (e.key === "tableChange") {
            openTableModal(order);
        }
    };


    const getDropDownItems = (order) => [
        {
            label: "Zmień typ zamówienia",
            key: "typeChange",
            onClick: (e) => handleMenuClick(e, order),
        },
        {
            label: "Zmień stolik",
            key: "tableChange",
            onClick: (e) => handleMenuClick(e, order),
        },
    ];


    const columns = [
        {
            title: "Typ",
            dataIndex: "type",
            key: "type",
            className: "w-1/3",
            render: (type) => (
                <Tag color={type === "dinein" ? "green" : "blue"}>
                    {type === "dinein" ? "W RESTAURACJI" : "NA WYNOS"}
                </Tag>
            ),
        },
        {
            title: "Stolik",
            dataIndex: "table_id",
            key: "table_id",
            className: "w-1/3",
            sorter: (a, b) => {
                const nameA = tableMap[a.table_id] || "";
                const nameB = tableMap[b.table_id] || "";
                return nameA.localeCompare(nameB, undefined, {numeric: true});
            },
            render: (tableId) => (tableId ? tableMap[tableId] : "-"),
        },
        {
            title: "Utworzono",
            dataIndex: "created_at",
            key: "created_at",
            className: "w-1/3",
            render: (date) => calculateMinutesAgo(date) + " min",
        },
        {
            key: "dropdown",
            className: "w-1",
            render: (_, record) => (
                <Dropdown
                    menu={{items: getDropDownItems(record)}}
                    trigger={["click"]}
                >
                    <a onClick={(e) => e.stopPropagation()}>
                        <EllipsisOutlined/>
                    </a>
                </Dropdown>
            ),
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
            children: <CurrentOrdersTable columns={columns} dataSource={getFilteredOrders(null)}
                                          onRow={handleRowClick}/>,
        },
        {
            key: '2',
            label: 'W restauracji',
            children: <CurrentOrdersTable columns={columns} dataSource={getFilteredOrders('dinein')}
                                          onRow={handleRowClick}/>,
        },
        {
            key: '3',
            label: 'Na wynos',
            children: <CurrentOrdersTable columns={columns} dataSource={getFilteredOrders('togo')}
                                          onRow={handleRowClick}/>,
        },
    ];

    if (loading) return <LoadingSpinner/>;

    return (
        <div className="flex justify-center flex-1 my-4 mx-1">
            <div className="bg-gray-100 p-4 shadow w-full rounded-lg lg:w-4/6">
                <Title level={2} className="text-center m-1">Aktualne zamówienia</Title>
                <Tabs defaultActiveKey="1" items={tabs}/>
            </div>
            <Modal
                title="Wybierz stół"
                centered
                open={isTableModalOpen}
                onCancel={() => setIsTableModalOpen(false)}
                footer={null}
            >
                <List
                    dataSource={tables}
                    renderItem={(table) => (
                        <List.Item>
                            <Button
                                type="primary"
                                block
                                disabled={!table.is_free}
                                onClick={() => handleTableSelect(table)}
                                className={!table.is_free ? "bg-gray-300 text-gray-500" : ""}
                            >
                                {table.name}
                            </Button>
                        </List.Item>
                    )}
                />
            </Modal>
        </div>
    );
};

export default CurrentOrders;
