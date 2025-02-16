import React, {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {Tag, Typography, DatePicker, Select, Button} from "antd";
import {fetchOrders, fetchTables, fetchUsers} from "../../services/api.js";
import LoadingSpinner from "../shared/LoadingSpinner.jsx";
import OrdersTable from "../Staff/OrdersTable.jsx";
import dayjs from "dayjs";

const {Title} = Typography;
const {RangePicker} = DatePicker;

const CurrentOrders = () => {
    const [orders, setOrders] = useState([]);
    const [tableMap, setTableMap] = useState({});
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const getDateParam = (param, format, defaultValue) => {
        return searchParams.get(param) ? dayjs(searchParams.get(param), format) : defaultValue;
    };

    const [dateRange, setDateRange] = useState([
        getDateParam("dateFrom", "YYYY-MM-DD", dayjs().startOf("month")),
        getDateParam("dateTo", "YYYY-MM-DD", dayjs().endOf("day"))
    ]);
    const [timeRange, setTimeRange] = useState([
        getDateParam("timeFrom", "HH:mm:ss", dayjs("00:00:00", "HH:mm:ss")),
        getDateParam("timeTo", "HH:mm:ss", dayjs("23:59:59", "HH:mm:ss"))
    ]);
    const [ordersType, setOrdersType] = useState(
        searchParams.get('type') === 'togo' || searchParams.get('type') === 'dinein' ? searchParams.get('type') : null);
    const [ordersCreatedBy, setOrdersCreatedBy] = useState(searchParams.get('createdBy') || null);
    const [ordersPaidBy, setOrdersPaidBy] = useState(searchParams.get('paidBy') || null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [ordersResponse, tablesResponse] = await Promise.all([
                    fetchOrders({
                        paid: true,
                        from_created_date: dateRange[0].format("YYYY-MM-DD") + " " + timeRange[0].format("HH:mm:ss"),
                        to_created_date: dateRange[1].format("YYYY-MM-DD") + " " + timeRange[1].format("HH:mm:ss"),
                        type: ordersType !== '' ? ordersType : null,
                        created_by: ordersCreatedBy !== '' ? ordersCreatedBy : null,
                        paid_by: ordersPaidBy !== '' ? ordersPaidBy : null,
                    }),
                    fetchTables(),
                ]);
                setOrders(ordersResponse.data);

                const tableMapData = {};
                tablesResponse.data.forEach((table) => {
                    tableMapData[table.id] = table.name;
                });
                setTableMap(tableMapData);

                const usersResponse = await Promise.race([fetchUsers()]);
                setUsers(usersResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dateRange, timeRange, ordersType, ordersCreatedBy, ordersPaidBy]);

    const updateSearchParams = (dates, times, type, createdBy, paidBy) => {
        const params = {};

        if (dates?.[0]) params.dateFrom = dates[0].format("YYYY-MM-DD");
        if (dates?.[1]) params.dateTo = dates[1].format("YYYY-MM-DD");
        if (times?.[0]) params.timeFrom = times[0].format("HH:mm:ss");
        if (times?.[1]) params.timeTo = times[1].format("HH:mm:ss");
        if (type) params.type = type;
        if (createdBy) params.createdBy = createdBy;
        if (paidBy) params.paidBy = paidBy;

        setSearchParams(params);
    };

    const handleDateChange = (dates) => {
        setDateRange(dates);
        updateSearchParams(dates, timeRange, ordersType, ordersCreatedBy, ordersPaidBy);
    };

    const handleTimeChange = (index, value) => {
        const newTimeRange = [...timeRange];
        newTimeRange[index] = value;
        setTimeRange(newTimeRange);
        updateSearchParams(dateRange, newTimeRange, ordersType, ordersCreatedBy, ordersPaidBy);
    };

    const handleOrderTypeChange = (value) => {
        setOrdersType(value);
        updateSearchParams(dateRange, timeRange, value, ordersCreatedBy, ordersPaidBy);
    };

    const handleCreatedByChange = (value) => {
        setOrdersCreatedBy(value);
        updateSearchParams(dateRange, timeRange, ordersType, value, ordersPaidBy);
    };

    const handlePaidByChange = (value) => {
        setOrdersPaidBy(value);
        updateSearchParams(dateRange, timeRange, ordersType, ordersCreatedBy, value);
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
        <div className="flex justify-center mb-4 my-3 mx-1 min-h-screen">
            <div className="bg-gray-100 rounded-lg shadow w-full lg:w-3/5 flex flex-col gap-3 pb-4">
                <Title level={2} className="text-center">Archiwum zamówień</Title>
                <div className="flex flex-wrap justify-center gap-2">
                    <div className="w-[270px] flex flex-col gap-2">
                        <Select className="w-full" defaultValue={ordersType || ''} onChange={handleOrderTypeChange}
                                options={[
                                    {
                                        value: '',
                                        label: <div className="text-gray-400">(Typ zamówienia)</div>,
                                    },
                                    {
                                        value: 'dinein',
                                        label: 'W restauracji',
                                    },
                                    {
                                        value: 'togo',
                                        label: 'Na wynos',
                                    },
                                ]}/>
                        <Select className="w-full" defaultValue={ordersCreatedBy || ''}
                                onChange={handleCreatedByChange}
                                options={[
                                    {
                                        value: '',
                                        label: <div className="text-gray-400">(Utworzone)</div>,
                                    },
                                    ...users.map(user => ({
                                        value: `${user.id}`,
                                        label: `${user.first_name} ${user.last_name} (${user.id})`
                                    }))]}
                        />
                        <Select className="w-full" defaultValue={ordersPaidBy || ''} onChange={handlePaidByChange}
                                options={[
                                    {
                                        value: '',
                                        label: <div className="text-gray-400">(Opłacone)</div>,
                                    },
                                    ...users.map(user => ({
                                        value: `${user.id}`,
                                        label: `${user.first_name} ${user.last_name} (${user.id})`
                                    }))]}
                        />
                    </div>
                    <div className="w-[270px] flex flex-col gap-2">
                        <RangePicker
                            value={dateRange}
                            onChange={handleDateChange}
                            format="DD-MM-YYYY"
                            placement={'bottomLeft'}
                            presets={innerWidth > 1000 && [
                                {
                                    label: 'Ostatnie 7 dni',
                                    value: [dayjs().add(-7, 'd'), dayjs()],
                                },
                                {
                                    label: 'Ostatnie 14 dni',
                                    value: [dayjs().add(-14, 'd'), dayjs()],
                                },
                                {
                                    label: 'Ostatnie 30 dni',
                                    value: [dayjs().add(-30, 'd'), dayjs()],
                                },
                                {
                                    label: 'Ostatnie 90 dni',
                                    value: [dayjs().add(-90, 'd'), dayjs()],
                                },
                            ]}
                        />
                        <div className="flex justify-between gap-3">
                            <DatePicker picker={'time'} value={timeRange[0]}
                                        onChange={(value) => handleTimeChange(0, value)}/>
                            <DatePicker picker={'time'} value={timeRange[1]}
                                        onChange={(value) => handleTimeChange(1, value)}/>
                        </div>
                        <Button className="w-full" onClick={() => {
                            const dates = [dayjs().startOf("month"), dayjs().endOf("day")]
                            const times = [dayjs("00:00:00", "HH:mm:ss"), dayjs("23:59:59", "HH:mm:ss")]
                            setDateRange(dates)
                            setTimeRange(times)
                            setOrdersType('')
                            setOrdersPaidBy('')
                            setOrdersCreatedBy('')
                            setSearchParams({})
                        }}>Resetuj</Button>
                    </div>
                </div>
                <div className="text-base font-semibold font-mono ml-4">
                    Zamówień: {orders.length} | Łączna suma: {orders.reduce((sum, order) => {
                    const totalSum = parseFloat(order.paid_by_card) + parseFloat(order.paid_by_cash);
                    return sum + totalSum;
                }, 0).toFixed(2)}
                </div>
                <div className="overflow-x-auto">
                    <OrdersTable columns={columns} dataSource={orders} onRow={handleRowClick} pagination={true}/>
                </div>
            </div>
        </div>
    );
};

export default CurrentOrders;
