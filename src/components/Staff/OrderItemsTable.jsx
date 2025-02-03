import React from 'react';
import {Button, InputNumber, Table} from "antd";
import {CloseOutlined} from "@ant-design/icons";

const OrderItemsTable = ({
                             orderItems,
                             handleQuantityChange,
                             handleRemoveItem,
                             editedQuantities,
                             handleInputChange,
                             handlePressEnter,
                             handleBlur
                         }) => {
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
                    {menuItem.price}
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
        },
        {
            title: <div>Usuń</div>,
            key: 'delete',
            className: 'hidden md:table-cell w-1',
            render: (_, orderItem) => (
                <div className="justify-self-center">
                    <CloseOutlined onClick={() => handleRemoveItem(orderItem)}/>
                </div>
            ),
        }
    ];

    return (
        <Table
            className="p-1"
            dataSource={orderItems}
            columns={columns}
            rowKey="id"
            pagination={false}
            locale={{emptyText: 'Tu będą widoczne pozycje zamówienia'}}
        />
    );
};

export default OrderItemsTable;
