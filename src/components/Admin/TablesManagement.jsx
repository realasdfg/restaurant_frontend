import React, {useEffect, useState} from "react";
import {Typography, Table, Modal, Input, message, Button, Form} from "antd";
import {addTableById, deleteTableById, fetchTables, updateTableById} from "../../services/api.js";
import LoadingSpinner from "../shared/LoadingSpinner.jsx";

const {Title} = Typography;

const TablesManagement = () => {
    const [editForm] = Form.useForm();
    const [addForm] = Form.useForm();
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const usersResponse = await fetchTables()
                setTables(usersResponse.data.sort((a, b) => a.name.localeCompare(b.name, undefined, {numeric: true})));
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (selectedTable) {
            editForm.setFieldsValue(selectedTable);
        }
    }, [selectedTable, editForm]);

    const tablesColumns = [
        {
            title: <div className="text-center">Name</div>,
            dataIndex: "name",
            key: "name",
            className: "bg-white",
            render: (name) => <div className="font-semibold text-center">{name}</div>,
        },
    ];

    const handleRowClick = (record) => ({
        onClick: () => {
            setSelectedTable(record);
            setIsEditModalOpen(true)
        },
        style: {cursor: "pointer"},
    });

    const handleEditTable = async (tableData) => {
        const isDuplicate = tables.some(table => table.name === tableData.name && table.id !== selectedTable.id);
        if (isDuplicate) {
            message.error("A table with that name already exists!");
            return;
        }

        try {
            await updateTableById(selectedTable.id, {name: tableData.name});
            message.success("The table data has been saved.");
            setTables(tables.map(table => (table.id === selectedTable.id ? {
                ...table, ...tableData,
            } : table)));
            setIsEditModalOpen(false);
            setSelectedTable(null)
        } catch (error) {
            message.error("An error occurred while saving the table data.");
            console.error("Table edit error:", error);
        }
    };

    const handleRemoveTable = async () => {
        try {
            await deleteTableById(selectedTable.id);
            message.success("The table has been removed.");
            setTables(prev => prev.filter(user => user.id !== selectedTable.id));
            setIsEditModalOpen(false);
            setSelectedTable(null)
        } catch (error) {
            message.error("An error occurred while deleting the table. The table may be in use.");
            console.error("Table remove error:", error);
        }
    };

    const handleAddTable = async (tableData) => {
        const isDuplicate = tables.some(table => table.name === tableData.name);
        if (isDuplicate) {
            message.error("A table with that name already exists!");
            return;
        }

        try {
            const newTableResponse = await addTableById({name: tableData.name});
            message.success("A new table has been created.");
            setTables([newTableResponse.data, ...tables]);
            setIsAddModalOpen(false);
            addForm.resetFields();
        } catch (error) {
            message.error("An error occurred while creating a new table.");
            console.error("Table creation error:", error);
        }
    };

    if (loading) return <LoadingSpinner/>;

    return (
        <div className="flex justify-center mb-4 my-3 mx-2 min-h-screen">
            <div className="bg-gray-100 rounded-lg shadow w-full lg:w-3/5 flex flex-col gap-3 pb-4">
                <Title level={2} className="text-center">Tables</Title>
                <Button color="blue" variant="solid" className="w-1/3 mx-4 self-center"
                        onClick={() => setIsAddModalOpen(true)}>
                    Add a table
                </Button>
                <div className="overflow-x-auto">
                    <Table
                        dataSource={tables}
                        columns={tablesColumns}
                        rowKey={(record) => record.id}
                        onRow={handleRowClick}
                        pagination={{
                            current: 1,
                            pageSize: 20,
                            total: tables.length,
                            position: ['topRight'],
                            showSizeChanger: true,
                            responsive: true,
                        }}
                        locale={{emptyText: 'There will be tables here'}}
                    />
                </div>
            </div>
            {selectedTable &&
                <Modal
                    title={<div className="text-xl text-center">Table {selectedTable.name}</div>}
                    centered
                    open={isEditModalOpen}
                    onCancel={() => {
                        setIsEditModalOpen(false);
                    }}
                    className="font-mono"
                    footer={null}
                >
                    <div className="flex flex-col justify-center">
                        <Form
                            form={editForm}
                            initialValues={selectedTable}
                            onFinish={handleEditTable}
                            layout="vertical"
                        >
                            <Form.Item
                                name="name"
                                label="Nazwa"
                                rules={[{
                                    required: true,
                                    min: 1,
                                    max: 10,
                                    message: 'The table name must contain between 1 and 10 characters!'
                                }]}
                            >
                                <Input/>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="w-full">
                                    Save
                                </Button>
                            </Form.Item>
                        </Form>

                        <Button color="danger" variant="solid" className="w-full mt-2 self-center"
                                onClick={handleRemoveTable} disabled={!selectedTable.is_free}>
                            {selectedTable.is_free ? 'Remove the table' : 'You cannot remove a reserved table'}
                        </Button>

                    </div>
                </Modal>
            }
            <Modal
                title={<div className="text-xl text-center">New Table</div>}
                centered
                open={isAddModalOpen}
                onCancel={() => {
                    setIsAddModalOpen(false);
                }}
                className="font-mono"
                footer={null}
            >
                <div className="flex flex-col justify-center">
                    <Form
                        form={addForm}
                        onFinish={handleAddTable}
                        layout="vertical"
                    >
                        <Form.Item
                            name="name"
                            label="Nazwa"
                            rules={[{
                                required: true,
                                min: 1,
                                max: 10,
                                message: 'The table name must contain between 1 and 10 characters!'
                            }]}
                        >
                            <Input/>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="w-full">
                                Add
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        </div>
    );
};

export default TablesManagement;
