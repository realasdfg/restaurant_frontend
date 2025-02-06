import React, {useState} from "react";
import {Dropdown, message} from "antd";
import {EllipsisOutlined} from "@ant-design/icons";
import {changeOrderInfo} from "../../services/api";
import TableListModal from "./TableListModal.jsx";

const OrderActionsDropdown = ({order, onUpdateOrder, iconClassName}) => {
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);

    const handleTableSelect = async (table) => {
        if (!table.is_free) return;
        try {
            await changeOrderInfo(order.id, {type: "dinein", table_id: table.id});
            onUpdateOrder(order.id, {type: "dinein", table_id: table.id});
            setIsTableModalOpen(false);
        } catch (error) {
            message.error("Błąd podczas zmiany stolika");
        }
    };

    const handleDropdownItemClick = async (e) => {
        e.domEvent.stopPropagation();
        if (e.key === "typeChange") {
            const newType = order.type === "dinein" ? "togo" : "dinein";
            if (newType === "dinein") {
                setIsTableModalOpen(true);
            } else {
                await changeOrderInfo(order.id, {type: newType, table_id: null});
                onUpdateOrder(order.id, {type: newType, table_id: null});
            }
        } else if (e.key === "tableChange") {
            setIsTableModalOpen(true);
        }
    };

    const dropdownItems = [
        {
            label: "Zmień typ zamówienia",
            key: "typeChange",
            onClick: handleDropdownItemClick,
        },
        {
            label: "Zmień stolik",
            key: "tableChange",
            onClick: handleDropdownItemClick,
        },
    ];

    return (
        <>
            <Dropdown menu={{items: dropdownItems}} trigger={["click"]}>
                <a onClick={(e) => e.stopPropagation()}>
                    <EllipsisOutlined className={`text-xl ${iconClassName || ''}`} />
                </a>
            </Dropdown>
            <TableListModal
                open={isTableModalOpen}
                onCancel={(e) => {
                    setIsTableModalOpen(false);
                    e.stopPropagation();
                }}
                onTableClick={(table, e) => {
                    e.stopPropagation();
                    handleTableSelect(table);
                }}
            />
        </>
    );
};

export default OrderActionsDropdown;
