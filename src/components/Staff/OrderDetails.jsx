import React, {useEffect, useState} from 'react';
import {
    fetchOrderById,
    fetchOrderItemsByOrderId,
    fetchTableById,
    fetchMenuItemById,
    updateOrderItemQuantity
} from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';
import {Button, InputNumber, Table, Tag, message} from "antd";

const OrderDetails = ({orderId}) => {
    const [order, setOrder] = useState(null);
    const [table, setTable] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editedQuantities, setEditedQuantities] = useState({});

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

    if (loading) return <LoadingSpinner/>;

    const handleQuantityChange = async (orderItemId, menuItemId, newQuantity) => {
        try {
            await updateOrderItemQuantity(orderId, menuItemId, newQuantity);
            setOrderItems((prev) =>
                prev.map((item) =>
                    item.id === orderItemId
                        ? {...item, quantity: newQuantity !== undefined ? newQuantity : item.quantity + 1}
                        : item
                )
            );
            message.success('Ilość zaktualizowana');
        } catch (error) {
            message.error('Błąd aktualizacji ilości');
            console.error('Update quantity error:', error);
        }
    };

    const handleInputChange = (orderItemId, value) => {
        setEditedQuantities((prev) => ({...prev, [orderItemId]: value}));
    };

    const handlePressEnter = async (orderItemId, menuItemId) => {
        if (editedQuantities[orderItemId] !== undefined) {
            await handleQuantityChange(orderItemId, menuItemId, editedQuantities[orderItemId]);
            setEditedQuantities((prev) => {
                const newQuantities = {...prev};
                delete newQuantities[orderItemId];
                return newQuantities;
            });
        }
    };

    const handleBlur = async (orderItemId, menuItemId) => {
        if (editedQuantities[orderItemId] !== undefined) {
            await handleQuantityChange(orderItemId, menuItemId, editedQuantities[orderItemId]);
            setEditedQuantities((prev) => {
                const newQuantities = {...prev};
                delete newQuantities[orderItemId];
                return newQuantities;
            });
        }
    };

    const columns = [
        {
            title: 'Nazwa',
            dataIndex: 'menuItem',
            key: 'name',
            render: (menuItem) => <div className="line-clamp-2">{menuItem.name}</div>,
        },
        {
            title: <div className="text-center">Ilość</div>,
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity, record) => (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        className="size-7"
                        onClick={() => handleQuantityChange(record.id, record.menuItem.id, Math.max(0, quantity - 1))}
                    >
                        -
                    </Button>
                    <span className="block sm:hidden">
                        {quantity.toString().length > 5 ? quantity.toString().slice(0, 3) + '...' : quantity}
                    </span>
                    <InputNumber
                        controls={false}
                        min={0}
                        parser={(value) => value.replace(/\D/g, '')}
                        value={editedQuantities[record.id] ?? quantity}
                        className="w-16 hidden sm:block"
                        onChange={(value) => handleInputChange(record.id, value)}
                        onPressEnter={() => handlePressEnter(record.id, record.menuItem.id)}
                        onBlur={() => handleBlur(record.id, record.menuItem.id)}
                    />
                    <Button
                        className="size-7"
                        onClick={() => handleQuantityChange(record.id, record.menuItem.id)}
                    >
                        +
                    </Button>
                </div>
            ),
        },
        {
            title: <div className="justify-self-end">Cena</div>,
            dataIndex: 'menuItem',
            key: 'price',
            render: (menuItem) => (
                <div className="justify-self-end">
                    {menuItem.price + (menuItem.type === 'by_weight' ? ' / 100g' : '')}
                </div>
            ),
        },
        {
            title: <div className="justify-self-end">Wartość</div>,
            key: 'total',
            render: (_, record) => (
                <div className="justify-self-end">
                    {record.menuItem.type === 'by_quantity'
                        ? (record.quantity * record.menuItem.price).toFixed(2)
                        : (record.quantity / 100 * record.menuItem.price).toFixed(2)}
                </div>
            ),
        }
    ];

    return (
        <div className="flex justify-center min-h-screen">
            <div className="bg-gray-100 rounded-lg shadow w-full lg:w-3/5 xl:w-2/5">
                <div className="p-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Zamówienie #{orderId}</h2>
                        {order.type === 'dinein' ? <Tag color='green'>W RESTAURACJI</Tag> :
                            <Tag color='blue'>NA WYNOS</Tag>}
                    </div>
                    <div className="flex justify-between items-center">
                        {order.type === 'dinein' && <div><strong>Stolik:</strong> {table.name}</div>}
                        <div><strong>Utworzone:</strong> {new Date(order.created_at).toLocaleString()}</div>
                    </div>
                    <Button type="primary" className="mt-3 mb-3">Dodaj pozycję</Button>
                </div>

                <Table
                    className="p-1"
                    dataSource={orderItems}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    locale={{emptyText: 'Tu będą widoczne pozycje zamówienia'}}
                />
            </div>
        </div>
    );
};

export default OrderDetails;
