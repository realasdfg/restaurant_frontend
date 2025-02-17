import React, {useEffect, useState} from "react";
import {Typography, Table, Modal, Input, message, Button, Form} from "antd";
import {addTableById, deleteTableById, fetchTables, updateTableById} from "../../services/api.js";
import LoadingSpinner from "../shared/LoadingSpinner.jsx";

const {Title} = Typography;

const TablesManagement = () => {
    const [form] = Form.useForm();
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
                setTables(usersResponse.data.sort((a, b) => a.name.localeCompare(b.name)));
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
            form.setFieldsValue(selectedTable);
        }
    }, [selectedTable, form]);

    const tablesColumns = [
        {
            title: <div className="text-center">Nazwa</div>,
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

    const handleConfirmTableChanges = async (tableData) => {
        const isDuplicate = tables.some(table => table.name === tableData.name && table.id !== selectedTable.id);
        if (isDuplicate) {
            message.error("Stolik o takiej nazwie już istnieje!");
            return;
        }

        try {
            await updateTableById(selectedTable.id, {name: tableData.name});
            message.success("Dane stolika zostały zapisane.");
            setTables(tables.map(table => (table.id === selectedTable.id ? {
                ...table, ...tableData,
            } : table)));
            setIsEditModalOpen(false);
            setSelectedTable(null)
        } catch (error) {
            message.error("Błąd podczas zapisywania danych stolika.");
            console.error("Table edit error:", error);
        }
    };

    const handleRemoveTable = async () => {
        try {
            await deleteTableById(selectedTable.id);
            message.success("Stolik usunięty.");
            setTables(prev => prev.filter(user => user.id !== selectedTable.id));
            setIsEditModalOpen(false);
            setSelectedTable(null)
        } catch (error) {
            message.error("Błąd podczas usuwania stolika.");
            console.error("Table remove error:", error);
        }
    };

    const handleAddTable = async (tableData) => {
        const isDuplicate = tables.some(table => table.name === tableData.name);
        if (isDuplicate) {
            message.error("Stolik o takiej nazwie już istnieje!");
            return;
        }

        try {
            const newTableResponse = await addTableById({name: tableData.name});
            message.success("Nowy stolik został utworzony.");
            setTables([newTableResponse.data, ...tables]);
            setIsAddModalOpen(false);
        } catch (error) {
            message.error("Błąd podczas tworzenia nowego stolika.");
            console.error("Table creation error:", error);
        }
    };

    if (loading) return <LoadingSpinner/>;

    return (
        <div className="flex justify-center mb-4 my-3 mx-2 min-h-screen">
            <div className="bg-gray-100 rounded-lg shadow w-full lg:w-3/5 flex flex-col gap-3 pb-4">
                <Title level={2} className="text-center">Stoliki</Title>
                <Button color="blue" variant="solid" className="w-1/3 mx-4 self-center"
                        onClick={() => setIsAddModalOpen(true)}>
                    Dodaj stolik
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
                        locale={{emptyText: 'Tu będą stoliki'}}
                    />
                </div>
            </div>
            {selectedTable &&
                <Modal
                    title={<div className="text-xl text-center">Stolik {selectedTable.name}</div>}
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
                            form={form}
                            initialValues={selectedTable}
                            onFinish={handleConfirmTableChanges}
                            layout="vertical"
                        >
                            <Form.Item
                                name="name"
                                label="Nazwa"
                                rules={[{
                                    required: true,
                                    min: 1,
                                    max: 10,
                                    message: 'Nazwa stolika musi zawierać od 1 do 10 znaków!'
                                }]}
                            >
                                <Input/>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="w-full">
                                    Zachowaj
                                </Button>
                            </Form.Item>
                        </Form>

                        <Button color="danger" variant="solid" className="w-full mt-2 self-center"
                                onClick={handleRemoveTable}>
                            Usuń stolik
                        </Button>

                    </div>
                </Modal>
            }
            <Modal
                title={<div className="text-xl text-center">Nowy stolik</div>}
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
                        form={form}
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
                                message: 'Nazwa stolika musi zawierać od 1 do 10 znaków!'
                            }]}
                        >
                            <Input/>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="w-full">
                                Dodaj
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        </div>
    );
};

export default TablesManagement;
