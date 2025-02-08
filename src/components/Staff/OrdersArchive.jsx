import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Tag, Typography} from "antd";
import {fetchOrders, fetchTables} from "../../services/api";
import LoadingSpinner from "../shared/LoadingSpinner";
import OrdersTable from "./OrdersTable.jsx";

const {Title} = Typography;

const CurrentOrders = () => {
    const [orders, setOrders] = useState([]);
    const [tableMap, setTableMap] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersResponse, tablesResponse] = await Promise.all([
                    fetchOrders({
                        paid_only: true,
                        from_paid_date: null,
                        to_paid_date: null,
                        type: null,
                    }),
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

    const columns = [
        {
            title: "#",
            dataIndex: "id",
            key: "id",
            className: "w-1 bg-white",
            render: (id) => <div className="font-semibold">{id}</div>,
        },
        {
            title: "Typ",
            dataIndex: "type",
            key: "type",
            className: "w-1 bg-white",
            render: (type) => (
                <Tag color={type === "dinein" ? "green" : "blue"}>
                    {type === "dinein" ? "DINE IN" : "TO GO"}
                </Tag>
            ),
        },
        {
            title: "Stolik",
            dataIndex: "table_id",
            key: "table_id",
            className: "w-1 bg-white text-center",
            render: (tableId) => (tableId ? tableMap[tableId] : "-"),
        },
        {
            title: "Utworzono",
            dataIndex: "created_at",
            key: "created_at",
            className: "bg-white",
            render: (date) => <>{new Date(date).toLocaleString()}</>,
        },
        {
            title: "Suma",
            key: "total_sum",
            className: "w-1 bg-white",
            render: (_, record) => <div className="text-end font-semibold">
                {(parseFloat(record.paid_by_card) + parseFloat(record.paid_by_cash)).toFixed(2)}
            </div>,
        },
    ];

    const handleRowClick = (record) => ({
        onClick: () => navigate(`/admin/orders/${record.id}`),
        style: {cursor: "pointer"},
    });

    if (loading) return <LoadingSpinner/>;

    return (
        <div className="flex justify-center mb-4 my-3 mx-1">
            <div className="bg-gray-100 rounded-lg shadow w-full lg:w-3/5 flex flex-col gap-3">
                <Title level={2} className="text-center mt-3">Archiwum zamówień</Title>
                <div className="overflow-x-auto mx-1">
                    <OrdersTable columns={columns} dataSource={orders} onRow={handleRowClick}/>
                </div>
            </div>
        </div>
    );
};

export default CurrentOrders;
