import React, { useEffect, useState } from 'react';
import { fetchOrderById } from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';

const OrderDetails = ({ orderId }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetchOrderById(orderId);
                setOrder(response.data);
                console.log(response.data)
            } catch (error) {
                console.error('Error fetching order details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="flex justify-center min-h-screen">
            <div className="bg-white p-4 rounded-lg shadow w-full lg:w-3/5 xl:w-2/5">
                <h2 className="text-xl font-bold">Деталі замовлення #{orderId}</h2>
                <p><strong>Тип:</strong> {order.type}</p>
                <p><strong>Стіл:</strong> {order.table_id ? order.table_id : '-'}</p>
                <p><strong>Дата створення:</strong> {new Date(order.created_at).toLocaleString()}</p>
                <p><strong>Оплата:</strong> {order.paid ? 'Оплачено' : 'Не оплачено'}</p>
            </div>
        </div>
    );
};

export default OrderDetails;
