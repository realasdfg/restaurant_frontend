import React, {useEffect, useState} from "react";
import {Typography, Table, Modal, Tag, Input, Select, message} from "antd";
import {fetchUserById, fetchUsers, updateUserById} from "../../services/api.js";
import LoadingSpinner from "../shared/LoadingSpinner.jsx";

const {Title} = Typography;
const {Search} = Input;

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState({});
    const [isOkDisabled, setIsOkDisabled] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [editedUser, setEditedUser] = useState({});


    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [usersResponse, currentUserResponse] = await Promise.all([
                    fetchUsers(),
                    fetchUserById('me')
                ]);
                setUsers(usersResponse.data);
                setCurrentUser(currentUserResponse.data);
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
            setSelectedUser({...record, 'password': ''});
            setEditedUser({...record, 'password': ''});
            setIsModalOpen(true)
        },
        style: {cursor: "pointer"},
    });

    const handleInputChange = (field, value) => {
        setEditedUser(prev => {
            const updatedUser = {...prev, [field]: value};
            if (
                updatedUser.username.length < 3 || updatedUser.username.length > 30 ||
                updatedUser.first_name.length < 1 || updatedUser.first_name.length > 30 ||
                updatedUser.last_name.length < 1 || updatedUser.last_name.length > 30 ||
                (updatedUser.password && updatedUser.password.length < 8) ||
                JSON.stringify(updatedUser) === JSON.stringify(selectedUser)
            ) {
                setIsOkDisabled(true);
            } else {
                setIsOkDisabled(false);
            }
            return updatedUser;
        });
    };

    const handleConfirmUserChanges = async () => {
        try {
            await updateUserById(selectedUser.id, {
                username: editedUser.username,
                first_name: editedUser.first_name,
                last_name: editedUser.last_name,
                role: editedUser.role,
                password: editedUser.password === '' ? null : editedUser.password,
            });
            message.success("Dane użytkownika zostały zapisane.");
            setUsers(users.map(user => (user.id === selectedUser.id ? editedUser : user)));
            setFilteredUsers(filteredUsers.map(user => (user.id === selectedUser.id ? editedUser : user)));
            setIsModalOpen(false);
        } catch (error) {
            message.error("Błąd podczas zapisywania danych użytkownika.");
            console.error("User edit error:", error);
        }
    };

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
                                        value={editedUser?.username || ''}
                                        onChange={(e) => handleInputChange('username', e.target.value)}
                                    />
                                ),
                            },
                            {
                                key: 'first_name',
                                label: <div className="text-base font-semibold">Imię:</div>,
                                value: (
                                    <Input
                                        value={editedUser?.first_name || ''}
                                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                                    />
                                ),
                            },
                            {
                                key: 'last_name',
                                label: <div className="text-base font-semibold">Nazwisko:</div>,
                                value: (
                                    <Input
                                        value={editedUser?.last_name || ''}
                                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                                    />
                                ),
                            },
                            {
                                key: 'role',
                                label: <div className="text-base font-semibold">Rola:</div>,
                                value: (
                                    <>
                                        {currentUser.id === selectedUser.id
                                            ? <Tag color={selectedUser.role === 'admin' ? 'red' : 'green'}
                                                   className="font-semibold">{selectedUser.role.toUpperCase()}</Tag>
                                            : <Select
                                                value={editedUser?.role}
                                                className="w-full"
                                                onChange={(value) => handleInputChange('role', value)}
                                                options={[
                                                    {value: 'admin', label: 'ADMIN'},
                                                    {value: 'staff', label: 'STAFF'},
                                                ]}
                                            />
                                        }
                                    </>
                                ),
                            },
                            {
                                key: 'new_password',
                                label: <div className="text-base font-semibold">Nowe hasło:</div>,
                                value: (
                                    <Input
                                        value={editedUser?.password || ''}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
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
