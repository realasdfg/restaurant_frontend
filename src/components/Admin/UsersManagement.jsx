import React, {useEffect, useState} from "react";
import {Typography, Table, Modal, Tag, Input, Select, message} from "antd";
import {fetchUsers, updateUserById} from "../../services/api.js";
import LoadingSpinner from "../shared/LoadingSpinner.jsx";
import Search from "antd/es/input/Search.js";

const {Title} = Typography;

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isOkDisabled, setIsOkDisabled] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const usersResponse = await fetchUsers();
                setUsers(usersResponse.data);
                setFilteredUsers(usersResponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const usersColumns = [
        {
            title: "Nazwa",
            dataIndex: "username",
            key: "username",
            className: "bg-white",
            render: (username) => <div className="font-semibold">{username}</div>,
        },
        {
            title: "Imię",
            dataIndex: "first_name",
            key: "first_name",
            className: "bg-white",
            render: (first_name) => <div>{first_name}</div>,
        },
        {
            title: "Nazwisko",
            dataIndex: "last_name",
            key: "last_name",
            className: "bg-white",
            render: (last_name) => <div>{last_name}</div>,
        },
        {
            title: "Rola",
            dataIndex: "role",
            key: "role",
            className: "bg-white",
            sorter: (a, b) => {
                const nameA = a.role || "";
                const nameB = b.role || "";
                return nameA.localeCompare(nameB, undefined, {numeric: true});
            },
            render: (role) => <Tag color={role === 'admin' ? 'red' : 'green'}
                                   className="font-semibold">{role.toUpperCase()}</Tag>,
        },
    ];

    const handleRowClick = (record) => ({
        onClick: () => {
            setSelectedUser(record);
            console.log(record)
            setIsModalOpen(true)
        },
        style: {cursor: "pointer"},
    });

    // const handleConfirmUserChanges = async () => {
    //     try {
    //         await updateUserById(/*userId*/, {
    //             username: null,
    //             first_name: null,
    //             last_name: null,
    //             role: null,
    //             password: null
    //         })
    //     } catch (error) {
    //         message.error('Błąd podczas zachowanie danych użytkownika');
    //         console.error('User edit error:', error);
    //     }
    // }

    const handleSearch = (value) => {
        setSearchQuery(value);
        if (value.trim() === '') {
            setFilteredUsers(users);
        } else {
            const lowercasedValue = value.toLowerCase();
            setFilteredUsers(
                users.filter(user =>
                    user.username.toLowerCase().includes(lowercasedValue) ||
                    user.first_name.toLowerCase().includes(lowercasedValue) ||
                    user.last_name.toLowerCase().includes(lowercasedValue)
                )
            );
        }
    };

    if (loading) return <LoadingSpinner/>;

    return (
        <div className="flex justify-center mb-4 my-3 mx-2 min-h-screen">
            <div className="bg-gray-100 rounded-lg shadow w-full lg:w-3/5 flex flex-col gap-3 pb-4">
                <Title level={2} className="text-center">Użytkownicy</Title>
                <Search
                    placeholder="Wyszukaj użytkowników..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    enterButton
                    className="lg:w-4/6 self-center px-4"
                />
                <div className="overflow-x-auto">
                    <Table
                        dataSource={filteredUsers}
                        columns={usersColumns}
                        rowKey={(record) => record.id}
                        onRow={handleRowClick}
                        pagination={{
                            current: 1,
                            pageSize: 20,
                            total: users.length,
                            position: ['topRight'],
                            showSizeChanger: true,
                            responsive: true,
                        }}
                        locale={{emptyText: 'Tu będą użytkownicy'}}
                    />
                </div>
            </div>
            {selectedUser &&
                <Modal
                    title={<div className="text-xl text-center">Użytkownik #{selectedUser.id}</div>}
                    centered
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    className="font-mono"
                    footer={(_, {OkBtn, CancelBtn}) => (
                        <div className="flex justify-between">
                            <CancelBtn/>
                            <OkBtn/>
                        </div>
                    )}
                    onOk={handleConfirmUserChanges}
                    okButtonProps={{disabled: isOkDisabled}}
                    okText="Zachowaj"
                    cancelText="Anuluj"
                >
                    <Table
                        pagination={false}
                        showHeader={false}
                        bordered
                        dataSource={[
                            {
                                key: 'username',
                                label: <div className="text-base font-semibold">Nazwa użytkownika:</div>,
                                value: (
                                    <Input
                                        value={selectedUser.username}
                                        // onChange={handleCashChange}
                                    />
                                ),
                            },
                            {
                                key: 'first_name',
                                label: <div className="text-base font-semibold">Imię:</div>,
                                value: (
                                    <Input
                                        value={selectedUser.first_name}
                                        // onChange={handleCashChange}
                                    />
                                ),
                            },
                            {
                                key: 'last_name',
                                label: <div className="text-base font-semibold">Nazwisko:</div>,
                                value: (
                                    <Input
                                        value={selectedUser.last_name}
                                        // onChange={handleCashChange}
                                    />
                                ),
                            },
                            {
                                key: 'role',
                                label: <div className="text-base font-semibold">Rola:</div>,
                                value: (
                                    <Select defaultValue={selectedUser.role} className="w-full"
                                            options={[
                                                {
                                                    value: 'admin',
                                                    label: 'ADMIN',
                                                },
                                                {
                                                    value: 'staff',
                                                    label: 'STAFF',
                                                },
                                            ]}
                                    />
                                ),
                            },
                            {
                                key: 'new_password',
                                label: <div className="text-base font-semibold">Nowe hasło:</div>,
                                value: (
                                    <Input
                                        // value={selectedUser.last_name}
                                        // onChange={handleCashChange}
                                    />
                                ),
                            },
                        ]}
                        columns={[
                            {dataIndex: 'label', key: 'label', className: 'w-1/2',},
                            {dataIndex: 'value', key: 'value'},
                        ]}
                    />
                </Modal>
            }
        </div>
    );
};

export default UsersManagement;
