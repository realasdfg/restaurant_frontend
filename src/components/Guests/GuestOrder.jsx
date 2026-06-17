import React, {useEffect, useState} from 'react';
import {Button, Table, Tag} from 'antd';
import 'tailwindcss/tailwind.css';
import {
    fetchCurrentOrdersByTableId,
    fetchMenuItemById,
    fetchOrderItemsByOrderId,
    fetchTableById
} from "../../services/api.js";
import GuestsHeader from "./GuestsHeader.jsx";
import GuestsFooter from "./GuestsFooter.jsx";
import LoadingSpinner from "../shared/LoadingSpinner.jsx";
import {useNavigate, useParams} from "react-router-dom";
import NotFoundPage from "../../pages/NotFoundPage.jsx";
import calculateTotalAmount from "../../utils/calculateTotalAmount.js";


const OnlineMenu = () => {
    const {tableId} = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [table, setTable] = useState(null);
    const [order, setOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tableResponse, orderResponse] = await Promise.all([
                    fetchTableById(tableId),
                    fetchCurrentOrdersByTableId(tableId)
                ]);
                setTable(tableResponse.data);
                if (!tableResponse.data.is_free) {
                    if (orderResponse.data) {
                        setOrder(orderResponse.data[0]);
                        const orderItemsResponse = await fetchOrderItemsByOrderId(orderResponse.data[0].id);
                        const itemsWithDetails = await Promise.all(
                            orderItemsResponse.data.map(async (orderItem) => {
                                const menuItemResponse = await fetchMenuItemById(orderItem.menu_item_id);
                                return {
                                    ...orderItem,
                                    menuItem: menuItemResponse.data
                                };
                            })
                        );
                        setOrderItems(itemsWithDetails.sort((a, b) => a.id - b.id));
                    }
                }

            } catch (error) {
                console.error(error)
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const tableColumns = [
        {
            title: "Name",
            dataIndex: "menuItem",
            key: "name",
            className: "bg-white",
            render: (menuItem) => <div className="line-clamp-2">{menuItem.name}</div>,
        },
        {
            title: <div className="justify-self-center">Quantity</div>,
            dataIndex: "quantity",
            key: "quantity",
            className: "w-1 bg-white",
            render: (quantity) => (
                <div className="justify-self-center sm:justify-self-start">
                    {quantity}
                </div>
            ),
        },
        {
            title: <div className="justify-self-end">Price</div>,
            dataIndex: "price",
            key: "price",
            className: "w-1 bg-white",
            render: (price) => <div className="justify-self-end">{price}</div>,
        },
        {
            title: <div className="justify-self-end">Total</div>,
            key: "total",
            className: "bg-white w-1",
            render: (_, record) => (
                <div className="justify-self-end">
                    {record.type === "by_quantity"
                        ? (Math.floor(record.quantity * Math.round(record.price * 100)) / 100).toFixed(2)
                        : (Math.floor((record.quantity / record.weight) * Math.round(record.price * 100)) / 100).toFixed(2)
                    }
                </div>
            ),
        }
    ];

    const totalAmount = calculateTotalAmount(orderItems);

    const handlePayment = () => {
        navigate(`/payment?orderId=${order.id}&tableId=${tableId}`);
    };

    if (notFound) return <><GuestsHeader isMenu={false}/><NotFoundPage/></>;
    if (loading) return <LoadingSpinner/>;

    return (
        <>
            <GuestsHeader isMenu={false}/>
            <div className="flex justify-center min-h-screen">
                <div className="bg-gray-200 rounded-lg shadow w-full lg:w-3/6 xl:w-2/5 flex flex-col m-2">
                    <div className="flex justify-between items-center m-3">
                        <span className="text-xl font-bold">Table: {table.name}</span>
                    </div>
                    {order
                        ? <div>
                            <div className="overflow-x-auto">
                                <Table
                                    className="p-1"
                                    dataSource={orderItems}
                                    columns={tableColumns}
                                    rowKey="id"
                                    pagination={false}
                                    locale={{emptyText: "The order items will be displayed here"}}
                                />
                            </div>
                            {order.paid_online &&
                                <Tag color="green-inverse" className="text-xl font-mono my-4 w-full">
                                    <div className="text-center">
                                        The order has already been paid for
                                    </div>
                                </Tag>
                            }
                            <div className="flex items-center justify-end bg-blue-300 p-3">
                                <div className="font-mono font-semibold text-xl">
                                    Suma: {totalAmount} $
                                </div>
                                <Button color="primary" variant="solid" disabled={totalAmount <= 0}
                                        className={"w-24 h-10 font-bold text-base shadow ml-2 " + (order.paid_online ? "hidden" : "")}
                                        onClick={handlePayment}>
                                    Pay
                                </Button>
                            </div>
                        </div>
                        : <div className="text-xl font-bold text-center">
                            There are no orders available
                        </div>
                    }
                </div>
            </div>
            <GuestsFooter/>
        </>
    );
};

export default OnlineMenu;
