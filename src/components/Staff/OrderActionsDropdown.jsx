import React, { useState } from "react";
import { Dropdown, Modal, List, Button, message } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { fetchTables, changeOrderInfo } from "../../services/api";

const OrderActionsDropdown = ({ order, onUpdateOrder }) => {
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [tables, setTables] = useState([]);

    const openTableModal = async () => {
        try {
            const response = await fetchTables();
            setTables(response.data.sort((a, b) => a.name.localeCompare(b.name)));
            setIsTableModalOpen(true);
        } catch (error) {
            message.error("Nie udało się załadować stolików");
            console.error("Error fetching tables:", error);
        }
    };

    const handleTableSelect = async (table) => {
        if (!table.is_free) return;

        try {
            await changeOrderInfo(order.id, { type: "dinein", table_id: table.id });
            onUpdateOrder(order.id, { type: "dinein", table_id: table.id });
            setIsTableModalOpen(false);
        } catch (error) {
            message.error("Błąd podczas zmiany stolika");
        }
    };

    const handleMenuClick = async (e) => {
        e.domEvent.stopPropagation();

        if (e.key === "typeChange") {
            const newType = order.type === "dinein" ? "togo" : "dinein";
            if (newType === "dinein") {
                openTableModal();
            } else {
                await changeOrderInfo(order.id, { type: newType, table_id: null });
                onUpdateOrder(order.id, { type: newType, table_id: null });
            }
        } else if (e.key === "tableChange") {
            openTableModal();
        }
    };

    const dropdownItems = [
        {
            label: "Zmień typ zamówienia",
            key: "typeChange",
            onClick: handleMenuClick,
        },
        {
            label: "Zmień stolik",
            key: "tableChange",
            onClick: handleMenuClick,
        },
    ];

    return (
        <>
            <Dropdown menu={{ items: dropdownItems }} trigger={["click"]}>
                <a onClick={(e) => e.stopPropagation()}>
                    <EllipsisOutlined />
                </a>
            </Dropdown>
            <Modal
                title="Wybierz stół"
                centered
                open={isTableModalOpen}
                onCancel={() => setIsTableModalOpen(false)}
                footer={null}
            >
                <List
                    dataSource={tables}
                    renderItem={(table) => (
                        <List.Item>
                            <Button
                                type="primary"
                                block
                                disabled={!table.is_free}
                                onClick={(e) =>{handleTableSelect(table);e.stopPropagation()}}
                                className={!table.is_free ? "bg-gray-300 text-gray-500" : ""}
                            >
                                {table.name}
                            </Button>
                        </List.Item>
                    )}
                />
            </Modal>
        </>
    );
};

export default OrderActionsDropdown;
