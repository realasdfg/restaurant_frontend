import React, {useEffect, useState} from "react";
import {Typography, Table, Modal, Tag, Input, message, Button} from "antd";
import {addUser, deleteUserById, fetchUserById, fetchUsers, updateUserById} from "../../services/api.js";
import LoadingSpinner from "../shared/LoadingSpinner.jsx";
import UserForm from "./UserForm.jsx";

const {Title} = Typography;
const {Search} = Input;

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [usersResponse, currentUserResponse] = await Promise.all([
                    fetchUsers(),
                    fetchUserById('me')
                ]);
                setUsers(usersResponse.data.sort((a, b) => b.id - a.id));
                setCurrentUser(currentUserResponse.data);
                setFilteredUsers(usersResponse.data.sort((a, b) => b.id - a.id));
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
            title: "Username",
            dataIndex: "username",
            key: "username",
            className: "bg-white",
            render: (username) => <div className="font-semibold">{username}</div>,
        },
        {
            title: "First name",
            dataIndex: "first_name",
            key: "first_name",
            className: "bg-white",
            render: (first_name) => <div>{first_name}</div>,
        },
        {
            title: "Last name",
            dataIndex: "last_name",
            key: "last_name",
            className: "bg-white",
            render: (last_name) => <div>{last_name}</div>,
        },
        {
            title: "Role",
            dataIndex: "role",
            key: "role",
            className: "bg-white",
            sorter: (a, b) => a.role.localeCompare(b.role),
            render: (role) => <Tag color={role === 'admin' ? 'red' : 'green'}
                                   className="font-semibold">{role.toUpperCase()}</Tag>,
        },
    ];

    const handleRowClick = (record) => ({
        onClick: () => {
            setSelectedUser({...record, 'password': ''});
            setIsEditModalOpen(true)
        },
        style: {cursor: "pointer"},
    });

    const handleEditUser = async (userData) => {
        const isDuplicate = users.some(user => user.username === userData.username && user.id !== selectedUser.id);
        if (isDuplicate) {
            message.error("A user with that name already exists!");
            return;
        }

        try {
            await updateUserById(selectedUser.id, {
                username: userData.username,
                first_name: userData.first_name,
                last_name: userData.last_name,
                role: userData.role,
                password: userData.password === '' ? null : userData.password,
            });
            message.success("Your user data has been saved.");
            setUsers(users.map(user => (user.id === selectedUser.id ? {
                ...user, ...userData,
                'password': null
            } : user)));
            setFilteredUsers(filteredUsers.map(user => (user.id === selectedUser.id ? {
                ...user, ...userData,
                'password': null
            } : user)));
            setIsEditModalOpen(false);
            setSelectedUser(null)
        } catch (error) {
            message.error("An error occurred while saving user data.");
            console.error("User edit error:", error);
        }
    };

    const handleRemoveUser = async () => {
        try {
            await deleteUserById(selectedUser.id);
            message.success("User deleted.");
            setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
            setFilteredUsers(prev => prev.filter(user => user.id !== selectedUser.id));
            setIsEditModalOpen(false);
            setSelectedUser(null)
        } catch (error) {
            message.error("An error occurred while deleting the user.");
            console.error("User remove error:", error);
        }
    };

    const handleAddUser = async (userData) => {
        const isDuplicate = users.some(user => user.username === userData.username);
        if (isDuplicate) {
            message.error("A user with that name already exists!");
            return;
        }

        try {
            const newUserResponse = await addUser({
                username: userData.username,
                first_name: userData.first_name,
                last_name: userData.last_name,
                role: userData.role,
                password: userData.password,
            });
            message.success("A new user has been created.");
            setUsers([newUserResponse.data, ...users]);
            setFilteredUsers([newUserResponse.data, ...filteredUsers]);
            setIsAddModalOpen(false);
        } catch (error) {
            message.error("An error occurred while creating a new user.");
            console.error("User creation error:", error);
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
                <Title level={2} className="text-center">Users</Title>
                <Search
                    placeholder="Search for users..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    enterButton
                    className="lg:w-4/6 self-center px-4"
                />
                <Button color="blue" variant="solid" className="w-1/3 mx-4 self-center"
                        onClick={() => setIsAddModalOpen(true)}>
                    Add a user
                </Button>
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
                        locale={{emptyText: 'Users will be here'}}
                    />
                </div>
            </div>
            {selectedUser &&
                <Modal
                    title={<div className="text-xl text-center">User #{selectedUser.id}</div>}
                    centered
                    open={isEditModalOpen}
                    onCancel={() => {
                        setIsEditModalOpen(false);
                    }}
                    className="font-mono"
                    footer={null}
                >
                    <div className="flex flex-col justify-center">
                        <UserForm isEditing={true} userData={selectedUser} currentUser={currentUser}
                                  onSubmit={handleEditUser}/>
                        {currentUser.id !== selectedUser.id
                            ?
                            <Button color="danger" variant="solid" className="w-full mt-2 self-center"
                                    onClick={handleRemoveUser}>
                                Delete User
                            </Button>
                            : null
                        }
                    </div>
                </Modal>
            }
            <Modal
                title={<div className="text-xl text-center">New User</div>}
                centered
                open={isAddModalOpen}
                onCancel={() => {
                    setIsAddModalOpen(false);
                }}
                className="font-mono"
                footer={null}
            >
                <div className="flex flex-col justify-center">
                    <UserForm isEditing={false} onSubmit={handleAddUser}/>
                </div>
            </Modal>
        </div>
    );
};

export default UsersManagement;
