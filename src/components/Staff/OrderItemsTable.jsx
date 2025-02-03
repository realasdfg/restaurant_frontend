import React, {useEffect, useState} from "react";
import {Table, Modal, Button, InputNumber, List} from "antd";
import {CloseOutlined} from "@ant-design/icons";

const OrderItemsTable = ({
                             orderItems,
                             handleQuantityChange,
                             handleRemoveItem,
                             handleQuantityInputConfirm
                         }) => {
    const [selectedItem, setSelectedItem] = useState(null);

    const updateSelectedItem = (updatedItem) => {
        setSelectedItem(prev =>
            prev && prev.id === updatedItem.id
                ? updatedItem
                : prev
        );
    };

    const handleQuantityChangeWrapper = async (orderItemId, menuItemId, newQuantity) => {
        if (!newQuantity) {
            await handleRemoveItemWrapper(selectedItem);
            return
        }
        await handleQuantityChange(orderItemId, menuItemId, newQuantity);
        const updatedItem = orderItems.find(item => item.id === orderItemId);
        if (updatedItem) {
            updateSelectedItem({...updatedItem, quantity: newQuantity});
        }
    };

    const handleQuantityInputConfirmWrapper = async (orderItemId, menuItemId, newQuantity) => {
        if (!newQuantity) {
            await handleRemoveItemWrapper(selectedItem);
            return
        }
        await handleQuantityInputConfirm(orderItemId, menuItemId, newQuantity);
        const updatedItem = orderItems.find(item => item.id === orderItemId);
        if (updatedItem) {
            updateSelectedItem({...updatedItem, quantity: newQuantity});
        }
    };

    const handleRemoveItemWrapper = async (orderItem) => {
        await handleRemoveItem(orderItem);
        setSelectedItem(null);
    };

    useEffect(() => {
        if (selectedItem) {
            const updatedItem = orderItems.find(item => item.id === selectedItem.id);
            if (updatedItem) {
                setSelectedItem(updatedItem);
            }
        }
    }, [orderItems]);

    const tableColumns = [
        {
            title: "Nazwa",
            dataIndex: "menuItem",
            key: "name",
            render: (menuItem) => <div className="line-clamp-2">{menuItem.name}</div>,
        },
        {
            title: <div className="text-center">Ilość</div>,
            dataIndex: "quantity",
            key: "quantity",
            render: (quantity, record) => (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        className="size-7"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleQuantityChange(record.id, record.menuItem.id, Math.max(0, quantity - 1));
                        }}
                    >
                        -
                    </Button>
                    <span className="block sm:hidden">
                        {quantity.toString().length > 5 ? quantity.toString().slice(0, 3) + '...' : quantity}
                    </span>
                    <InputNumber
                        type="number"
                        controls={false}
                        min={0}
                        value={quantity}
                        className="w-16 hidden sm:block"
                        onPressEnter={(e) => handleQuantityInputConfirm(record.id, record.menuItem.id, parseInt(e.target.value))}
                        onBlur={(e) => handleQuantityInputConfirm(record.id, record.menuItem.id, parseInt(e.target.value))}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                        className="size-7"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleQuantityChange(record.id, record.menuItem.id);
                        }}
                    >
                        +
                    </Button>
                </div>
            ),
        },
        {
            title: <div className="justify-self-end">Cena</div>,
            dataIndex: "menuItem",
            key: "price",
            render: (menuItem) => <div className="justify-self-end">{menuItem.price} zł</div>,
        },
        {
            title: <div className="justify-self-end">Wartość</div>,
            key: "total",
            render: (_, record) => (
                <div className="justify-self-end">
                    {record.menuItem.type === "by_quantity"
                        ? (record.quantity * record.menuItem.price).toFixed(2)
                        : (record.quantity / 100 * record.menuItem.price).toFixed(2)} zł
                </div>
            ),
        },
        {
            title: <div>Usuń</div>,
            key: "delete",
            className: "hidden sm:table-cell w-1",
            render: (_, orderItem) => (
                <div className="justify-self-center">
                    <CloseOutlined onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(orderItem)
                    }}/>
                </div>
            ),
        },
    ];

    const listData = selectedItem && [
        {
            label: "Ilość",
            value:
                <div className="flex items-center gap-2">
                    <Button
                        className="size-7"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleQuantityChangeWrapper(selectedItem.id, selectedItem.menuItem.id, Math.max(0, selectedItem.quantity - 1));
                        }}
                    >
                        -
                    </Button>
                    <InputNumber
                        type="number"
                        controls={false}
                        min={0}
                        value={selectedItem.quantity}
                        className="w-20"
                        onPressEnter={(e) => handleQuantityInputConfirmWrapper(selectedItem.id, selectedItem.menuItem.id, parseInt(e.target.value))}
                        onBlur={(e) => handleQuantityInputConfirmWrapper(selectedItem.id, selectedItem.menuItem.id, parseInt(e.target.value))}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                        className="size-7"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleQuantityChangeWrapper(selectedItem.id, selectedItem.menuItem.id, selectedItem.quantity + 1);
                        }}
                    >
                        +
                    </Button>
                </div>,
        },
        {
            label: "Cena",
            value: <>{selectedItem.menuItem.price} zł {selectedItem.menuItem.type === "by_weight" ? '/ 100 g' : ''}</>
        },
        {
            label: "Wartość",
            value: selectedItem.menuItem.type === "by_quantity"
                ? `${(selectedItem.quantity * selectedItem.menuItem.price).toFixed(2)} zł`
                : `${(selectedItem.quantity / 100 * selectedItem.menuItem.price).toFixed(2)} zł`
        },
    ];

    return (
        <>
            <Table
                className="p-1"
                dataSource={orderItems}
                columns={tableColumns}
                rowKey="id"
                pagination={false}
                locale={{emptyText: "Tu będą widoczne pozycje zamówienia"}}
                onRow={(record) => ({
                    onClick: () => setSelectedItem(record),
                })}
            />

            <Modal
                title={<div className="text-black text-xl">{selectedItem?.menuItem?.name}</div>}
                centered
                open={!!selectedItem}
                onCancel={() => setSelectedItem(null)}
                footer={null}
            >
                {selectedItem && (
                    <List
                        bordered
                        dataSource={listData}
                        renderItem={(item) => (
                            <List.Item>
                                <div className="flex items-center gap-2">
                                    <strong>{item.label}:</strong> {item.value}
                                </div>
                            </List.Item>
                        )}
                    />
                )}
                <div className="flex justify-between">
                    <Button color="danger" variant="solid" className="mt-2"
                            onClick={() => handleRemoveItemWrapper(selectedItem)}>Usuń</Button>
                    <Button color="blue" variant="solid" className="mt-2"
                            onClick={() => setSelectedItem(null)}>Ok</Button>
                </div>
            </Modal>
        </>
    );
};

export default OrderItemsTable;
