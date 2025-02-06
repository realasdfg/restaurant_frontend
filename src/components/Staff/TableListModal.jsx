import React from "react";
import {Modal, List, Button} from "antd";


const TableListModal = ({ open, onCancel, onclick, tables }) => {
    return (
        <Modal
            title="Wybierz stół"
            centered
            open={open}
            onCancel={onCancel}
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
                            onClick={(event) => onclick(table, event)}
                            className={!table.is_free ? 'bg-gray-300 text-gray-500' : ''}
                        >
                            {table.name}
                        </Button>
                    </List.Item>
                )}
            />
        </Modal>
    );
};


export default TableListModal;
