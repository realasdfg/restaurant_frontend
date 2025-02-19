import React, {useEffect, useState} from "react";
import {useSearchParams} from "react-router-dom";
import {Typography, DatePicker, Button, Select} from "antd";
import {fetchCategories, fetchDailyRevenue, fetchTotalRevenue} from "../../services/api.js";
import LoadingSpinner from "../shared/LoadingSpinner.jsx";
import dayjs from "dayjs";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from "recharts";

const {Title} = Typography;
const {RangePicker} = DatePicker;

const Statistics = () => {
    const [loading, setLoading] = useState(true);
    const [totalRevenue, setTotalRevenue] = useState({});
    const [dailyRevenue, setDailyRevenue] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();

    const getDateParam = (param, format, defaultValue) => {
        return searchParams.get(param) ? dayjs(searchParams.get(param), format) : defaultValue;
    };

    const [dateRange, setDateRange] = useState([
        getDateParam("dateFrom", "YYYY-MM-DD", dayjs().startOf("month")),
        getDateParam("dateTo", "YYYY-MM-DD", dayjs().endOf("day"))
    ]);
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category_id') || '');
    const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
    const [period, setPeriod] = useState(searchParams.get('period') || 'daily');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const from_date = dateRange[0].format("YYYY-MM-DD");
                const to_date = dateRange[1].format("YYYY-MM-DD");
                const [totalRevenueResponse, dailyRevenueResponse,
                    categoriesResponse] = await Promise.all([
                    fetchTotalRevenue({
                        from_date: from_date,
                        to_date: to_date,
                        category_id: selectedCategory !== '' ? selectedCategory : null,
                        type: selectedType !== '' ? selectedType : null,
                        period: period !== '' ? period : 'daily',
                    }),
                    fetchDailyRevenue({
                        from_date: from_date,
                        to_date: to_date,
                        category_id: selectedCategory !== '' ? selectedCategory : null,
                        type: selectedType !== '' ? selectedType : null,
                        period: period !== '' ? period : 'daily',
                    }),
                    fetchCategories(),
                ]);
                setTotalRevenue(totalRevenueResponse.data);
                setDailyRevenue(dailyRevenueResponse.data);
                setCategories(categoriesResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dateRange, selectedCategory, selectedType, period]);

    const updateSearchParams = (dates, category_id, type, period) => {
        const params = {};
        if (dates?.[0]) params.dateFrom = dates[0].format("YYYY-MM-DD");
        if (dates?.[1]) params.dateTo = dates[1].format("YYYY-MM-DD");
        if (category_id) params.category_id = category_id;
        if (type) params.type = type;
        if (period) params.period = period;
        setSearchParams(params);
    };

    const handleDateChange = (dates) => {
        setDateRange(dates);
        updateSearchParams(dates, selectedCategory, selectedType, period);
    };

    const handleCategoryChange = (value) => {
        setSelectedCategory(value);
        updateSearchParams(dateRange, value, selectedType, period);
    };

    const handleTypeChange = (value) => {
        setSelectedType(value);
        updateSearchParams(dateRange, selectedCategory, value, period);
    };

    const handlePeriodChange = (value) => {
        setPeriod(value);
        updateSearchParams(dateRange, selectedCategory, selectedType, value);
    };


    return (
        <div className="flex justify-center mb-4 my-3 mx-1 min-h-screen">
            <div className="bg-gray-100 rounded-lg shadow w-full lg:w-3/5 flex flex-col gap-3 pb-4">
                <Title level={2} className="text-center">Statystyka dochodów</Title>
                <div className="flex justify-center">
                    <div className="w-[350px] flex flex-col gap-2">
                        <RangePicker
                            value={dateRange}
                            onChange={handleDateChange}
                            format="DD-MM-YYYY"
                        />
                        <Select onChange={handleCategoryChange} value={selectedCategory} defaultValue={''}>
                            <Option key='' value=''>
                                <div className="text-gray-400">Wybierz kategorię</div>
                            </Option>
                            {categories.map((category) => (
                                <Option key={category.id} value={category.id}>{category.name}</Option>
                            ))}
                        </Select>
                        <Select onChange={handleTypeChange} value={selectedType} defaultValue={''}>
                            <Option key='' value=''>
                                <div className="text-gray-400">Wybierz typ</div>
                            </Option>
                            <Option key='togo' value='togo'>Na wynos</Option>
                            <Option key='dinein' value='dinein'>W restauracji</Option>
                        </Select>
                        <Select onChange={handlePeriodChange} value={period} defaultValue={'daily'}>
                            <Option key='daily' value='daily'>Dziennie</Option>
                            <Option key='weekly' value='weekly'>Tygodniowo</Option>
                            <Option key='monthly' value='monthly'>Miesięcznie</Option>
                        </Select>
                        <Button className="w-full" onClick={() => {
                            setDateRange([dayjs().startOf("month"), dayjs().endOf("day")]);
                            setSearchParams({});
                            setSelectedCategory('');
                            setSelectedType('');
                            setPeriod('daily');
                        }}>Resetuj</Button>
                    </div>
                </div>
                {!loading
                    ? <>
                        <div className="px-4">
                            <Title level={4}>Łączne dochody</Title>
                            <p>Całkowity przychód: {totalRevenue.total_revenue} zł</p>
                            <p>Całkowity koszt: {totalRevenue.total_cost} zł</p>
                            <p>Całkowity zysk: {totalRevenue.total_profit} zł</p>
                        </div>
                        <div className="px-4">
                            <Title
                                level={4}>Dochody {period === 'daily' ? 'dzienne' : period === 'weekly' ? 'tygodniowe' : 'miesięczne'}</Title>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={dailyRevenue} margin={{bottom: 30}}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={80}/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Legend verticalAlign="bottom" height={36}/>
                                    <Line type="monotone" dataKey="total_revenue" stroke="#8884d8" name="Przychód"/>
                                    <Line type="monotone" dataKey="total_cost" stroke="#82ca9d" name="Koszt"/>
                                    <Line type="monotone" dataKey="total_profit" stroke="#ff7300" name="Zysk"/>
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