import React, {useEffect, useState} from 'react';
import {
    fetchOrderById,
    fetchOrderItemsByOrderId,
    fetchTableById,
    fetchMenuItemById,
    addOrUpdateOrderItemQuantity, deleteOrderItem
} from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';
import {Button, Tag, message} from "antd";
import AddOrderItemDrawer from "./AddOrderItemDrawer.jsx";
import OrderItemsTable from "./OrderItemsTable.jsx";
import OrderCloseModal from "./OrderCloseModal.jsx";

const CurrentOrderDetails = ({orderId}) => {
    const [order, setOrder] = useState(null);
    const [table, setTable] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [orderResponse, orderItemsResponse] = await Promise.all([
                    fetchOrderById(orderId),
                    fetchOrderItemsByOrderId(orderId),
                ]);
                setOrder(orderResponse.data);

                if (orderResponse.data.table_id) {
                    const tableResponse = await fetchTableById(orderResponse.data.table_id);
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
            } catch (error) {
                console.error('Error fetching order details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [orderId]);


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
            message.success(`${itemName} został(a) dodana!`);
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

    const totalAmount = orderItems.reduce((sum, item) => {
        const itemTotal = item.menuItem.type === "by_quantity"
            ? item.quantity * item.menuItem.price
            : (item.quantity / 100) * item.menuItem.price;
        return sum + itemTotal;
    }, 0).toFixed(2);

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
                    <div className="text-end items-center">
                        {order.type === 'dinein' && (
                            <div>
                                <strong>Stolik:</strong>
                                <Tag color="green" className="text-sm">
                                    {table.name}
                                </Tag>
                            </div>
                        )}
                    </div>

                    <AddOrderItemDrawer
                        visible={isDrawerOpen}
                        onClose={() => setIsDrawerOpen(false)}
                        onAddItem={handleAddItem}
                    />
                </div>
                <div className="overflow-x-auto">
                    <OrderItemsTable
                        orderItems={orderItems}
                        handleQuantityChange={handleQuantityChange}
                        handleQuantityInputConfirm={handleQuantityInputConfirm}
                        handleRemoveItem={handleRemoveItem}
                    />
                </div>

                {/* Large screens */}
                <div
                    className="hidden sm:flex sticky -bottom-0.5 justify-between items-center bg-blue-500 shadow-md p-3">
                    <Button color="primary" variant="outlined" onClick={() => setIsDrawerOpen(true)}>
                        Dodaj
                    </Button>
                    <div>
                        <span className="font-bold text-xl text-white">{totalAmount} zł</span>
                        <Button color="primary" variant="outlined"
                                className="w-24 h-10 font-bold text-base shadow ml-2"
                                onClick={() => setIsModalOpen(true)}>
                            Zamknij
                        </Button>
                    </div>
                </div>

                {/* Small screens */}
                <div
                    className="sm:hidden fixed left-0 w-full -bottom-0.5 flex justify-between items-center bg-blue-500 shadow-md p-3">
                    <Button color="primary" variant="outlined" onClick={() => setIsDrawerOpen(true)}>
                        Dodaj
                    </Button>
                    <div className="mr-6">
                        <span className="font-bold text-xl text-white">{totalAmount} zł</span>
                        <Button color="primary" variant="outlined"
                                className="w-24 h-10 font-bold text-base shadow ml-2"
                                onClick={() => setIsModalOpen(true)}>
                            Zamknij
                        </Button>
                    </div>
                </div>
            </div>
            <OrderCloseModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                totalAmount={totalAmount}
                orderId={orderId}
            />
        </div>
    );
};

export default CurrentOrderDetails;
