import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Tag, Typography, DatePicker} from "antd";
import {fetchOrders, fetchTables} from "../../services/api";
import LoadingSpinner from "../shared/LoadingSpinner";
import OrdersTable from "./OrdersTable.jsx";
import dayjs from "dayjs";

const {Title} = Typography;
const {RangePicker} = DatePicker;

const CurrentOrders = () => {
    const [orders, setOrders] = useState([]);
    const [tableMap, setTableMap] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [dateRange, setDateRange] = useState([dayjs().startOf("month"), dayjs()]);
    const [timeRange, setTimeRange] = useState([
        dayjs("00:00:00", "HH:mm:ss"),
        dayjs("23:59:59", "HH:mm:ss")
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [ordersResponse, tablesResponse] = await Promise.all([
                    fetchOrders({
                        paid_only: true,
                        from_created_date: dateRange[0].format("YYYY-MM-DD") + " " + timeRange[0].format("HH:mm:ss"),
                        to_created_date: dateRange[1].format("YYYY-MM-DD") + " " + timeRange[1].format("HH:mm:ss"),
                        type: null,
                        created_by: null,
                        paid_by: null,
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
    }, [dateRange, timeRange]);

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
            className: "w-1 bg-white",
            sorter: (a, b) => a.type.localeCompare(b.type, undefined, {numeric: true}),
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
            className: "bg-white",
            sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
            render: (date) => <>{new Date(date).toLocaleString()}</>,
        },
        {
            title: "Zapłacono",
            dataIndex: "paid_at",
            key: "paid_at",
            className: "bg-white",
            sorter: (a, b) => new Date(a.paid_at) - new Date(b.paid_at),
            render: (date) => <>{new Date(date).toLocaleString()}</>,
        },
        {
            title: "Suma",
            key: "total_sum",
            className: "w-1 bg-white",
            sorter: (a, b) => {
                return (parseFloat(a.paid_by_card) + parseFloat(a.paid_by_cash)) -
                    (parseFloat(b.paid_by_card) + parseFloat(b.paid_by_cash));
            },
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
            <div className="bg-gray-100 rounded-lg shadow w-full lg:w-3/5 flex flex-col gap-3 p-4">
                <Title level={2} className="text-center">Archiwum zamówień</Title>

                <div className="text-center gap-2 px-4">
                    <RangePicker
                        value={dateRange}
                        onChange={setDateRange}
                        format="YYYY-MM-DD"
                    />
                    <div className="flex gap-4 justify-center mt-2">

                    <DatePicker picker={'time'} value={timeRange[0]}
                                onChange={(value) => setTimeRange([value, timeRange[1]])}/>
                    <DatePicker picker={'time'} value={timeRange[1]}
                                onChange={(value) => setTimeRange([timeRange[0], value])}/>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <OrdersTable columns={columns} dataSource={orders} onRow={handleRowClick}/>
                </div>
            </div>
        </div>
    );
};

export default CurrentOrders;
