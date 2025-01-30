import React, {useEffect, useState} from 'react';
import {fetchOrderById, fetchOrderItemsById, fetchTableById, fetchMenuItemById} from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';
import {Button, InputNumber, Table, Tag} from "antd";

const OrderDetails = ({orderId}) => {
    const [order, setOrder] = useState(null);
    const [table, setTable] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [orderResponse, orderItemsResponse] = await Promise.all([
                    fetchOrderById(orderId),
                    fetchOrderItemsById(orderId),
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

                setOrderItems(itemsWithDetails);
            } catch (error) {
                console.error('Error fetching order details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [orderId]);

    if (loading) return <LoadingSpinner/>;

    const columns = [
        {
            title: 'Nazwa',
            dataIndex: 'menuItem',
            key: 'name',
            render: (menuItem) => menuItem.name
        },
        {
            title: 'Ilość',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity) => <div className="flex items-center gap-2">
                <Button className="size-7">-</Button>
                <InputNumber min={0} defaultValue={quantity} className="w-14"/> {/*onChange={onChange}*/}
                <Button className="size-7">+</Button>
            </div>
        },
        {
            title: 'Cena (zł)',
            dataIndex: 'menuItem',
            key: 'price',
            render: (menuItem) => menuItem.price + (menuItem.type === 'by_weight' ? ' / 100g' : '')
        },
        {
            title: 'Suma (zł)',
            key: 'total',
            render: (_, record) => record.menuItem.type === 'by_quantity'
                ? (record.quantity * record.menuItem.price).toFixed(2)
                : (record.quantity / 100 * record.menuItem.price).toFixed(2)
        }
    ];

    return (
        <div className="flex justify-center min-h-screen">
            <div className="bg-white p-4 pt-1 rounded-lg shadow w-full lg:w-3/5 xl:w-2/5">
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
                <Table
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
