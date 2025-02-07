import React, {useEffect, useState} from 'react';
import {
    fetchOrderById,
    fetchOrderItemsByOrderId,
    fetchTableById,
    fetchMenuItemById,
    addOrUpdateOrderItemQuantity, deleteOrderItem, fetchUserById
} from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';
import {Button, Tag, message} from "antd";
import AddOrderItemDrawer from "./AddOrderItemDrawer.jsx";
import OrderItemsTable from "./OrderItemsTable.jsx";
import OrderCloseModal from "./OrderCloseModal.jsx";
import OrderActionsDropdown from "./OrderActionsDropdown.jsx";
import {orderWebSocketService} from "../../services/websocketService.js";
import NotFoundPage from "../../pages/NotFoundPage.jsx";

const OrderDetails = ({orderId}) => {
    const [notFound, setNotFound] = useState(false);
    const [order, setOrder] = useState(null);
    const [table, setTable] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userCreated, setUserCreated] = useState(null);
    const [userPaid, setUserPaid] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [orderResponse, orderItemsResponse] = await Promise.all([
                    fetchOrderById(orderId),
                    fetchOrderItemsByOrderId(orderId),
                ]);
                const orderResponseData = orderResponse.data
                setOrder(orderResponseData);

                if (orderResponseData.table_id) {
                    const tableResponse = await fetchTableById(orderResponseData.table_id);
                    setTable(tableResponse.data);
                }

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

                if (orderResponseData.paid) {
                    const [userCreatedResponse, userPaidResponse] = await Promise.all([
                        fetchUserById(orderResponseData.created_by),
                        fetchUserById(orderResponseData.paid_by),
                    ]);
                    setUserCreated(userCreatedResponse.data)
                    setUserPaid(userPaidResponse.data)
                }

            } catch (error) {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [orderId]);

    useEffect(() => {
        if (!order || order.paid) return;

        const orderSocket = orderWebSocketService.connectToOrder(orderId);

        orderSocket.connect();

        const unsubscribe = orderSocket.subscribe(async (data) => {
            if (data.type) {
                console.log(`Order ${orderId} info changes received:`, data);
                setOrder(data);

                if (data.table_id) {
                    const tableResponse = await fetchTableById(data.table_id);
                    setTable(tableResponse.data);
                } else {
                    setTable(null);
                }
            } else {
                console.log(`Order ${orderId} items changes received:`, data);
                if (data.deleted) {
                    setOrderItems((prevOrderItems = []) => {
                        return prevOrderItems.filter(o => o.id !== data.id);
                    });
                } else {
                    fetchMenuItemById(data.menu_item_id).then((menuItemResponse) => {
                        const dataWithDetails = {
                            ...data,
                            menuItem: menuItemResponse.data
                        };

                        setOrderItems((prevOrderItems = []) => {
                            const orderItemIndex = prevOrderItems.findIndex(o => o.id === data.id);
                            if (orderItemIndex !== -1) {
                                return prevOrderItems.map(o => (o.id === dataWithDetails.id ? dataWithDetails : o));
                            } else {
                                return [...prevOrderItems, dataWithDetails];
                            }
                        });
                    });
                }
            }
        });

        return () => {
            unsubscribe();
            orderSocket.close();
        };
    }, [order]);


    const handleAddItem = async (menuItemId, menuItemAddQuantity) => {
        try {
            if (menuItemAddQuantity > 9999999) {
                message.error('Za duża ilość pozycji');
                return;
            }
            const orderItem = orderItems.find((item) => item.menu_item_id === menuItemId);
            let itemName;
            if (orderItem) {
                itemName = orderItem.menuItem.name;
                let newQuantity = orderItem.quantity + menuItemAddQuantity;
                if (newQuantity > 9999999) {
                    message.error('Za duża ilość pozycji');
                    return;
                }
                await handleQuantityChange(orderItem.id, menuItemId, newQuantity);
            } else {
                const response = await addOrUpdateOrderItemQuantity(orderId, menuItemId, menuItemAddQuantity);
                const menuItemResponse = await fetchMenuItemById(response.data.menu_item_id);
                const itemWithDetails = {...response.data, menuItem: menuItemResponse.data}
                setOrderItems([...orderItems, itemWithDetails]);

                itemName = menuItemResponse.data.name;
            }
            message.success(`Pozycja "${itemName}" została dodana!`);
        } catch (error) {
            message.error('Błąd dodawania pozycji');
            console.error('Add item error:', error);
        }
    };

    const handleQuantityChange = async (orderItemId, menuItemId, newQuantity) => {
        try {
            if (newQuantity === 0) {
                await handleRemoveItem(orderItems.find(item => item.id === orderItemId));
            } else {
                await addOrUpdateOrderItemQuantity(orderId, menuItemId, newQuantity);
                setOrderItems((prev) =>
                    prev.map((item) =>
                        item.id === orderItemId
                            ? {...item, quantity: newQuantity !== undefined ? newQuantity : item.quantity + 1}
                            : item
                    )
                );
            }
        } catch (error) {
            message.error('Błąd aktualizacji ilości');
            console.error('Update quantity error:', error);
        }
    };

    const handleQuantityInputConfirm = async (orderItemId, menuItemId, newQuantity) => {
        const orderItem = orderItems.find(item => item.id === orderItemId);
        if (newQuantity) {
            if (newQuantity > 9999999) {
                message.error('Za duża ilość pozycji');
                return;
            }
            if (orderItem.quantity !== newQuantity) {
                await handleQuantityChange(orderItemId, menuItemId, newQuantity);
            }
        } else {
            await handleRemoveItem(orderItem);
        }
    };

    const handleRemoveItem = async (orderItem) => {
        try {
            await deleteOrderItem(orderId, orderItem.menu_item_id);
            setOrderItems(orderItems.filter(item => item !== orderItem));
        } catch (error) {
            message.error('Błąd usuwania pozycji');
            console.error('Remove item error:', error);
        }
    };

    const handleOrderInfoUpdate = async (orderId, data) => {
        setOrder({...order, ...data});
        if (data.table_id) {
            const tableResponse = await fetchTableById(data.table_id);
            setTable(tableResponse.data);
        } else {
            setTable(null);
        }
    }

    const totalAmount = orderItems.reduce((sum, item) => {
        const itemTotal = item.menuItem.type === "by_quantity"
            ? item.quantity * item.menuItem.price
            : (item.quantity / 100) * item.menuItem.price;
        return sum + itemTotal;
    }, 0).toFixed(2);

    if (notFound) return <NotFoundPage message="Zamówienie nie istnieje"/>;

    if (loading) return <LoadingSpinner/>;

    return (
        <div className="flex justify-center mb-4 m-3">
            <div className="bg-gray-100 rounded-lg shadow w-full lg:w-3/6 xl:w-2/5 flex flex-col mb-14 sm:mb-0">
                <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xl font-bold">Zamówienie #{orderId}</span>
                        {order.type === 'dinein' ? (
                            <Tag color="green" className="text-sm">
                                W RESTAURACJI
                            </Tag>
                        ) : (
                            <Tag color="blue" className="text-sm">
                                NA WYNOS
                            </Tag>
                        )}
                    </div>
                    {table && (
                        <div className="text-end">
                            <strong>Stolik:</strong>
                            <Tag color="green" className="text-sm">
                                {table.name}
                            </Tag>
                        </div>
                    )}
                    {order.paid &&
                        <div className="flex gap-2 mt-2">
                            <Tag color="blue" className="text-sm">
                                <strong>Utworzono: </strong><br/>
                                {new Date(order.created_at).toLocaleString()} <br/>
                                Przez: {userCreated.first_name + ' ' + userCreated.last_name} ({userCreated.id})
                            </Tag>
                            <Tag color="blue" className="text-sm">
                                    <span>
                                    <strong>Zapłacono: </strong><br/>
                                        {new Date(order.paid_at).toLocaleString()} <br/>
                                        Przez: {userPaid.first_name + ' ' + userPaid.last_name} ({userPaid.id}) <br/>
                                    </span>
                                <span>
                                    <strong>Kartą: {order.paid_by_card} zł</strong> <br/>
                                    <strong>Gotówką: {order.paid_by_cash} zł</strong>
                                    </span>
                            </Tag>
                        </div>
                    }
                </div>
                <div className="overflow-x-auto">
                    <OrderItemsTable
                        order={order}
                        orderItems={orderItems}
                        handleQuantityChange={handleQuantityChange}
                        handleQuantityInputConfirm={handleQuantityInputConfirm}
                        handleRemoveItem={handleRemoveItem}
                    />
                </div>

                {/* Large screens */}
                <div
                    className="hidden sm:block sticky -bottom-0.5 bg-blue-500 shadow-md p-3">
                    {!order.paid
                        ? <div className="hidden sm:flex justify-between items-center">
                            <div>
                                <OrderActionsDropdown order={order} onUpdateOrder={handleOrderInfoUpdate}
                                                      iconClassName="text-white"/>
                                <Button className="ml-2" color="primary" variant="outlined"
                                        onClick={() => setIsDrawerOpen(true)}>
                                    Dodaj
                                </Button>
                            </div>
                            <div>
                                <span className="font-bold text-xl text-white">{totalAmount} zł</span>
                                <Button color="primary" variant="outlined" disabled={parseFloat(totalAmount) === 0}
                                        className="w-24 h-10 font-bold text-base shadow ml-2"
                                        onClick={() => setIsModalOpen(true)}>
                                    Zamknij
                                </Button>
                            </div>
                        </div>
                        : <div className="hidden sm:flex justify-end items-center">
                            <span className="font-bold text-xl text-white">Suma: {totalAmount} zł</span>
                        </div>
                    }
                </div>

                {/* Small screens */}
                <div
                    className="sm:hidden fixed left-0 w-full -bottom-0.5 bg-blue-500 shadow-md p-3">
                    {!order.paid
                        ? <div className="flex justify-between items-center">
                            <div>
                                <OrderActionsDropdown order={order} onUpdateOrder={handleOrderInfoUpdate}
                                                      iconClassName="text-white"/>
                                <Button className="ml-2" color="primary" variant="outlined"
                                        onClick={() => setIsDrawerOpen(true)}>
                                    Dodaj
                                </Button>
                            </div>
                            <div className="mr-6">
                                <span className="font-bold text-xl text-white">{totalAmount} zł</span>
                                <Button color="primary" variant="outlined" disabled={parseFloat(totalAmount) === 0}
                                        className="w-24 h-10 font-bold text-base shadow ml-2"
                                        onClick={() => setIsModalOpen(true)}>
                                    Zamknij
                                </Button>
                            </div>
                        </div>
                        : <div className="flex justify-end items-center">
                            <span className="font-bold text-xl text-white mr-6">Suma: {totalAmount} zł</span>
                        </div>
                    }
                </div>
            </div>
            {!order.paid &&
                <OrderCloseModal
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    totalAmount={parseFloat(totalAmount)}
                    orderId={orderId}
                />
                &&
                <AddOrderItemDrawer
                    visible={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    onAddItem={handleAddItem}
                />
            }

        </div>
    );
};

export default OrderDetails;
