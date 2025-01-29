import React, {useEffect, useState} from 'react';
import {fetchOrderById, fetchTableById} from '../../services/api';
import LoadingSpinner from '../shared/LoadingSpinner';
import {Button, Table} from "antd";

const OrderDetails = ({orderId}) => {
    const [order, setOrder] = useState(null);
    const [table, setTable] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const orderResponse = await fetchOrderById(orderId);
                setOrder(orderResponse.data);
                if (orderResponse.data.table_id) {
                    const tableResponse = await fetchTableById(orderResponse.data.table_id);
                    setTable(tableResponse.data);
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [orderId]);

    if (loading) return <LoadingSpinner/>;

    return (
        <div className="flex justify-center min-h-screen">
            <div className="bg-white p-4 rounded-lg shadow w-full lg:w-3/5 xl:w-2/5">
                <h2 className="text-xl font-bold">Szczegóły zamówienia #{orderId}</h2>
                <p><strong>Typ:</strong> {order.type === 'dinein' ? 'W restauracji' : 'Na wynos'}</p>
                <p><strong>Stolik:</strong> {table ? table.name : '-'}</p>
                <p><strong>Utworzony:</strong> {new Date(order.created_at).toLocaleString()}</p>
                <Button color="primary" variant="outlined" className="mb-3">Dodaj pozycji</Button>
                <Table>

                </Table>
            </div>
        </div>
    );
};

export default OrderDetails;
