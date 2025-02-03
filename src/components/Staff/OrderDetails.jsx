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

const OrderDetails = ({orderId}) => {
    const [order, setOrder] = useState(null);
    const [table, setTable] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const handleAddItem = async (menuItemId, menuItemAddQuantity) => {
        try {
            const orderItem = orderItems.find((item) => item.menu_item_id === menuItemId);
            let itemName;
            if (orderItem) {
                itemName = orderItem.menuItem.name;
                await handleQuantityChange(orderItem.id, menuItemId, orderItem.quantity + menuItemAddQuantity);
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

    const handleRemoveItem = async (orderItem) => {
        try {
            await deleteOrderItem(orderId, orderItem.menu_item_id);
            setOrderItems(orderItems.filter(item => item !== orderItem));
        } catch (error) {
            message.error('Błąd usuwania pozycji');
            console.error('Remove item error:', error);
        }
    };

    const handleQuantityInputConfirm = async (orderItemId, menuItemId, newQuantity) => {
        const orderItem = orderItems.find(item => item.id === orderItemId);
        if (newQuantity) {
            if (orderItem.quantity !== newQuantity) {
                await handleQuantityChange(orderItemId, menuItemId, newQuantity);
            }
        } else {
            await handleRemoveItem(orderItem);
        }
    };

    if (loading) return <LoadingSpinner/>;

    return (
        <div className="flex justify-center flex-1 mb-4 m-3">
            <div className="bg-gray-100 rounded-lg shadow w-full lg:w-3/6 xl:w-2/5">
                <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xl font-bold">Zamówienie #{orderId}</span>
                        {order.type === 'dinein' ? <Tag color='green' className="text-sm">W RESTAURACJI</Tag> :
                            <Tag color='blue' className="text-sm">NA WYNOS</Tag>}
                    </div>
                    <div className="flex justify-between items-center">
                        <Button type="primary" onClick={() => setIsModalOpen(true)}>
                            Dodaj pozycję
                        </Button>
                        {order.type === 'dinein' && <div><strong>Stolik:</strong><Tag color="green"
                                                                                      className="text-sm"> {table.name}</Tag>
                        </div>}
                    </div>
                    <AddOrderItemDrawer
                        visible={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onAddItem={handleAddItem}
                    />
                </div>
                <OrderItemsTable
                    orderItems={orderItems}
                    handleQuantityChange={handleQuantityChange}
                    handleRemoveItem={handleRemoveItem}
                    handleQuantityInputConfirm={handleQuantityInputConfirm}
                />
            </div>
        </div>
    );
};

export default OrderDetails;
