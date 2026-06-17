import React, {useEffect, useState} from "react";
import {Table, Modal, Button, List} from "antd";
import {CloseOutlined} from "@ant-design/icons";
import ItemQuantityInput from "./ItemQuantityInput.jsx";

const OrderItemsTable = ({
                             order,
                             orderItems,
                             handleQuantityChange,
                             handleRemoveItem,
                             handleQuantityInputConfirm
                         }) => {
    const [selectedItem, setSelectedItem] = useState(null);

    const handleQuantityChangeWrapper = async (orderItemId, menuItemId, newQuantity) => {
        if (!newQuantity) {
            await handleRemoveItemWrapper(selectedItem);
            return
        }
        await handleQuantityChange(orderItemId, menuItemId, newQuantity);
    };

    const handleQuantityInputConfirmWrapper = async (orderItemId, menuItemId, newQuantity) => {
        if (!newQuantity) {
            await handleRemoveItemWrapper(selectedItem);
            return
        }
        await handleQuantityInputConfirm(orderItemId, menuItemId, newQuantity);
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
            render: (quantity, record) => (
                <div className="justify-self-center sm:justify-self-start">
                    {!order.paid
                        ? <ItemQuantityInput
                            value={quantity}
                            onChangeBtns={(newQuantity) => handleQuantityChange(record.id, record.menuItem.id, newQuantity)}
                            onConfirm={(newQuantity) => handleQuantityInputConfirm(record.id, record.menuItem.id, newQuantity)}
                            showCompact={true}
                            className="w-20"
                        />
                        : quantity}
                </div>
            ),
        },
        {
            title: <div className="justify-self-end">Cena</div>,
            dataIndex: "menuItem",
            key: "price",
            className: "w-1 bg-white",
            render: (menuItem) => <div className="justify-self-end">{menuItem.price}</div>,
        },
        {
            title: <div className="justify-self-end">Value</div>,
            key: "total",
            className: "bg-white w-1",
            render: (_, record) => (
                <div className="justify-self-start">
                    {record.type === "by_quantity"
                        ? (Math.floor(record.quantity * Math.round(record.price * 100)) / 100).toFixed(2)
                        : (Math.floor((record.quantity / record.weight) * Math.round(record.price * 100)) / 100).toFixed(2)
                    }
                </div>
            ),
        },
        {
            key: "delete",
            className: "hidden sm:table-cell w-1 bg-white",
            render: !order.paid ? (
                    (_, orderItem) => (
                        <div className="justify-self-center">
                            <CloseOutlined onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveItem(orderItem)
                            }}/>
                        </div>
                    ))
                : undefined,
        }
    ];

    const listData = selectedItem && [
        {
            label: "Quantity",
            value: (
                <ItemQuantityInput
                    value={selectedItem.quantity}
                    onChangeBtns={(newQuantity) => handleQuantityChangeWrapper(selectedItem.id, selectedItem.menuItem.id, newQuantity)}
                    onConfirm={(newQuantity) => handleQuantityInputConfirmWrapper(selectedItem.id, selectedItem.menuItem.id, newQuantity)}
                    className="w-20"
                />
            ),
        },
        {
            label: "Cena",
            value: <>{selectedItem.menuItem.price} $ {selectedItem.menuItem.type === "by_weight" ? '/ 100 g' : ''}</>
        },
        {
            label: "Value",
            value: selectedItem.menuItem.type === "by_quantity"
                ? `${(selectedItem.quantity * selectedItem.menuItem.price).toFixed(2)} $`
                : `${(selectedItem.quantity / 100 * selectedItem.menuItem.price).toFixed(2)} $`
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
                locale={{emptyText: "The order items will be displayed here"}}
                onRow={(record) => ({
                    onClick: () => setSelectedItem(record),
                })}
            />
            {!order.paid &&
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
                                onClick={() => {
                                    handleRemoveItem(selectedItem);
                                    setSelectedItem(null)
                                }}>Delete</Button>
                        <Button color="blue" variant="solid" className="mt-2"
                                onClick={() => setSelectedItem(null)}>Ok</Button>
                    </div>
                </Modal>
            }
        </>
    );
};

export default OrderItemsTable;
