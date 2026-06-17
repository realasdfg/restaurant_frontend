import React, {useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {Typography, DatePicker, Button, Select} from "antd";
import {fetchCategories, fetchTotalRevenue} from "../../services/api.js";
import LoadingSpinner from "../shared/LoadingSpinner.jsx";
import dayjs from "dayjs";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from "recharts";

const {Title} = Typography;
const {RangePicker} = DatePicker;

const Statistics = () => {
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [totalRevenue, setTotalRevenue] = useState({});
    const [dailyRevenue, setDailyRevenue] = useState([]);
    const [categories, setCategories] = useState([]);

    const getDateParam = (param, format, defaultValue) => {
        return searchParams.get(param) ? dayjs(searchParams.get(param), format) : defaultValue;
    };

    const [dateRange, setDateRange] = useState([
        getDateParam("dateFrom", "YYYY-MM-DD", dayjs().startOf("month")),
        getDateParam("dateTo", "YYYY-MM-DD", dayjs().endOf("day"))
    ]);
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoryId') || '');
    const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
    const [period, setPeriod] = useState(searchParams.get('period') || 'daily');
    const [paidOnline, setPaidOnline] = useState(searchParams.get('paidOnline') || '');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const from_date = dateRange[0].format("YYYY-MM-DD");
                const to_date = dateRange[1].format("YYYY-MM-DD");
                const [totalRevenueResponse, periodicalRevenueResponse,
                    categoriesResponse] = await Promise.all([
                    fetchTotalRevenue({
                        from_date: from_date,
                        to_date: to_date,
                        category_id: selectedCategory !== '' ? selectedCategory : null,
                        type: selectedType !== '' ? selectedType : null,
                        paid_online: paidOnline !== '' ? paidOnline : null,
                    }),
                    fetchTotalRevenue({
                        from_date: from_date,
                        to_date: to_date,
                        category_id: selectedCategory !== '' ? selectedCategory : null,
                        type: selectedType !== '' ? selectedType : null,
                        period: period !== '' ? period : 'daily',
                        paid_online: paidOnline !== '' ? paidOnline : null,
                    }),
                    fetchCategories({include_deleted: true}),
                ]);
                setTotalRevenue(totalRevenueResponse.data);
                setDailyRevenue(periodicalRevenueResponse.data);
                setCategories(categoriesResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dateRange, selectedCategory, selectedType, period, paidOnline]);

    const updateSearchParams = (dates, categoryId, type, period, paidOnline) => {
        const params = {};
        if (dates?.[0]) params.dateFrom = dates[0].format("YYYY-MM-DD");
        if (dates?.[1]) params.dateTo = dates[1].format("YYYY-MM-DD");
        if (categoryId) params.categoryId = categoryId;
        if (type) params.type = type;
        if (period) params.period = period;
        if (paidOnline) params.paidOnline = paidOnline;
        setSearchParams(params);
    };

    const handleDateChange = (dates) => {
        setDateRange(dates);
        updateSearchParams(dates, selectedCategory, selectedType, period, paidOnline);
    };

    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
        updateSearchParams(dateRange, value, selectedType, period, paidOnline);
    };

    const handleTypeChange = (value) => {
        setSelectedType(value);
        updateSearchParams(dateRange, selectedCategory, value, period, paidOnline);
    };

    const handlePeriodChange = (value) => {
        setPeriod(value);
        updateSearchParams(dateRange, selectedCategory, selectedType, value, paidOnline);
    };

    const handlePaidOnlineChange = (value) => {
        setPaidOnline(value);
        updateSearchParams(dateRange, selectedCategory, selectedType, period, value);
    };


    return (
        <div className="flex justify-center mb-4 my-3 mx-1 min-h-screen">
            <div className="bg-gray-100 rounded-lg shadow w-full lg:w-3/5 flex flex-col gap-3 pb-4">
                <Title level={2} className="text-center">Revenue Statistics</Title>
                <div className="flex justify-center">
                    <div className="w-[350px] flex flex-col gap-2">
                        <RangePicker
                            value={dateRange}
                            onChange={handleDateChange}
                            format="DD-MM-YYYY"
                            placement={'bottomLeft'}
                            presets={innerWidth > 1000 && [
                                {
                                    label: 'Last 7 days',
                                    value: [dayjs().add(-7, 'd'), dayjs()],
                                },
                                {
                                    label: 'Last 14 days',
                                    value: [dayjs().add(-14, 'd'), dayjs()],
                                },
                                {
                                    label: 'Last 30 days',
                                    value: [dayjs().add(-30, 'd'), dayjs()],
                                },
                                {
                                    label: 'Last 90 days',
                                    value: [dayjs().add(-90, 'd'), dayjs()],
                                },
                            ]}
                        />
                        <Select onChange={handleCategoryChange} value={selectedCategory} defaultValue={''}>
                            <Select.Option key='' value=''>
                                <div className="text-gray-400">Select a category</div>
                            </Select.Option>
                            {categories.map((category) => (
                                <Select.Option key={category.id} value={category.id}>{category.name}</Select.Option>
                            ))}
                        </Select>
                        <Select onChange={handleTypeChange} value={selectedType} defaultValue={''}>
                            <Select.Option key='' value=''>
                                <div className="text-gray-400">Select a type</div>
                            </Select.Option>
                            <Select.Option key='togo' value='togo'>To go</Select.Option>
                            <Select.Option key='dinein' value='dinein'>Dine in</Select.Option>
                        </Select>
                        <Select onChange={handlePaidOnlineChange} value={paidOnline} defaultValue={''}>
                            <Select.Option key='' value=''>Total fee</Select.Option>
                            <Select.Option key='true' value='true'>Paid online</Select.Option>
                            <Select.Option key='false' value='false'>Paid offline</Select.Option>
                        </Select>
                        <Select onChange={handlePeriodChange} value={period} defaultValue={'daily'}>
                            <Select.Option key='daily' value='daily'>Daily</Select.Option>
                            <Select.Option key='weekly' value='weekly'>Weekly</Select.Option>
                            <Select.Option key='monthly' value='monthly'>Monthly</Select.Option>
                        </Select>
                        <Button className="w-full" onClick={() => {
                            setDateRange([dayjs().startOf("month"), dayjs().endOf("day")]);
                            setSearchParams({});
                            setSelectedCategory('');
                            setSelectedType('');
                            setPeriod('daily');
                            setPaidOnline('');
                        }}>Reset</Button>
                    </div>
                </div>
                {!loading
                    ? <>
                        <div className="px-4">
                            <Title level={4}>Total revenue</Title>
                            <p>Total revenue: <strong>{totalRevenue.total_revenue?.toFixed(2)} $</strong></p>
                            {selectedCategory === ''
                                ?
                                <>
                                    <p>Revenue from card
                                        payments: <strong>{totalRevenue.card_revenue?.toFixed(2)} $</strong></p>
                                    <p>Revenue from cash
                                        payments: <strong>{totalRevenue.cash_revenue?.toFixed(2)} $</strong></p>
                                </>
                                : ''
                            }
                            <p>Total cost: <strong>{totalRevenue.total_cost?.toFixed(2)} $</strong></p>
                            <p>Total profit: <strong>{totalRevenue.total_profit?.toFixed(2)} $</strong></p>
                        </div>
                        <div className="px-4">
                            <Title className="p-0 m-0" level={4}>
                                {period === 'daily' ? 'Daily' : period === 'weekly' ? 'Weekly' : 'Monthly'} income
                            </Title>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={dailyRevenue} margin={{bottom: 30}}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={80}/>
                                    <YAxis tickFormatter={(value) => value.toFixed(2)}/>
                                    <Tooltip
                                        formatter={(value, name) => {
                                            const labels = {
                                                total_revenue: "Income",
                                                card_revenue: "Income (Card)",
                                                cash_revenue: "Income (Cash)",
                                                total_cost: "Cost",
                                                total_profit: "Profit",
                                            };
                                            return [value.toFixed(2), labels[name] || name];
                                        }}
                                        content={({payload}) => {
                                            if (!payload || payload.length === 0) return null;
                                            return (
                                                <div className="bg-white p-2 shadow rounded text-sm">
                                                    <p className="font-bold">{payload[0].payload.date}</p>
                                                    {payload.map((entry, index) => (
                                                        <p key={index} style={{color: entry.color}}>
                                                            {entry.name}: {entry.value.toFixed(2)} $
                                                        </p>
                                                    ))}
                                                    {selectedCategory === ''
                                                        ?
                                                        <>
                                                            <p style={{color: "#8884d8"}}>Income
                                                                (Card): {payload[0].payload.card_revenue?.toFixed(2) || "0.00"} $</p>
                                                            <p style={{color: "#8884d8"}}>Income
                                                                (Cash): {payload[0].payload.cash_revenue?.toFixed(2) || "0.00"} $</p>
                                                        </>
                                                        : ''
                                                    }
                                                </div>
                                            );
                                        }}
                                    />
                                    <Legend verticalAlign="bottom" height={36}/>
                                    <Line type="monotone" dataKey="total_revenue" stroke="#8884d8" name="Revenue"/>
                                    <Line type="monotone" dataKey="total_cost" stroke="#82ca9d" name="Cost"/>
                                    <Line type="monotone" dataKey="total_profit" stroke="#ff7300" name="Profit"/>
                                </LineChart>
                            </ResponsiveContainer>


                        </div>
                    </>
                    : <LoadingSpinner/>
                }
            </div>
        </div>
    );
};

export default Statistics;