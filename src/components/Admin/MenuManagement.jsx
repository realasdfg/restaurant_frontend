import React, {useEffect, useState} from "react";
import {Typography, Table, Modal, Tag, Input, message, Button, Form} from "antd";
import {
    addCategory,
    addMenuItem,
    deleteCategoryById,
    deleteMenuItemById,
    fetchCategories,
    fetchMenuItems,
    updateCategoryById,
    updateMenuItemById
} from "../../services/api.js";
import LoadingSpinner from "../shared/LoadingSpinner.jsx";
import MenuItemForm from "./MenuItemForm.jsx";

const {Title} = Typography;
const {Search} = Input;

const MenuManagement = () => {
    const [categoryForm] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCategories, setFilteredCategories] = useState([]);

    const [addType, setAddType] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [itemsResponse, categoriesResponse] = await Promise.all([
                    fetchMenuItems(),
                    fetchCategories()
                ]);
                const sortedCategories = categoriesResponse.data.sort((a, b) => a.name.localeCompare(b.name));
                setCategories(sortedCategories);
                setFilteredCategories(sortedCategories);
                setMenuItems(itemsResponse.data.sort((a, b) => a.name.localeCompare(b.name)));
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (selectedRowData) {
            categoryForm.setFieldsValue(selectedRowData);
        }
    }, [selectedRowData, categoryForm]);

    const categoryColumns = [
        {
            title: "Category",
            dataIndex: "name",
            key: "name",
            className: "bg-white",
            render: (name) => <div className="font-semibold">{name}</div>,
        }
    ];

    const menuItemColumns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            className: "bg-white",
            render: (name) => <div className="font-semibold w-[250px]">{name}</div>,
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            className: "bg-white w-1",
            sorter: (a, b) => a.type.localeCompare(b.type),
            render: (type) => <Tag color={type === 'by_weight' ? 'blue' : 'green'}
                                   className="font-semibold">{type === 'by_weight' ? 'By Weight' : 'By Quantity'}</Tag>,
        },
        {
            title: <div className="justify-self-center">Weight</div>,
            dataIndex: "weight",
            key: "weight",
            className: "bg-white w-1",
            render: (weight) => <div className="text-center">{weight}</div>,
        },
        {
            title: <div className="justify-self-end">Cena</div>,
            dataIndex: "price",
            key: "price",
            className: "bg-white w-1",
            sorter: (a, b) => a.price - b.price,
            render: (price) => <div className="text-end">{price}</div>,
        },
        {
            title: <div className="justify-self-end">Cost</div>,
            dataIndex: "cost",
            key: "cost",
            className: "bg-white w-1",
            sorter: (a, b) => a.cost - b.cost,
            render: (cost) => <div className="text-end">{cost}</div>,
        },
        {
            title: <div className="justify-self-center">Available</div>,
            dataIndex: "available",
            key: "available",
            className: "bg-white w-1",
            sorter: (a, b) => a.available - b.available,
            render: (available) => <div className="text-center">{available ? <div className='text-green-600'>Tak</div> :
                <div className='text-red-600'>Nie</div>}</div>,
        },
    ];

    const handleRowClick = (record) => ({
        onClick: () => {
            const rowType = 'price' in record ? 'menuItem' : 'category';
            setSelectedRowData({...record, 'rowType': rowType});
            setIsEditModalOpen(true)
        },
        style: {cursor: "pointer"},
    });

    const handleEditMenuItem = async (menuItemData) => {
        const isDuplicate = menuItems.some(item => item.name === menuItemData.name && item.id !== selectedRowData.id);
        if (isDuplicate) {
            message.error("A menu item with that name already exists!");
            return;
        }

        try {
            const image =
                menuItemData.newImage && menuItemData.newImage.length > 0
                    ? menuItemData.newImage[0].originFileObj : null;

            const menuItemResponse = await updateMenuItemById(selectedRowData.id, {
                name: menuItemData.name,
                description: menuItemData.description,
                price: menuItemData.price,
                cost: menuItemData.cost,
                type: menuItemData.type,
                weight: menuItemData.weight,
                available: menuItemData.available,
            }, image);
            message.success("The menu item data has been saved.");
            setMenuItems(menuItems.map(item => (item.id === selectedRowData.id ? {
                ...item, ...menuItemResponse.data
            } : item)));
            setIsEditModalOpen(false);
            setSelectedRowData(null)
        } catch (error) {
            message.error("An error occurred while saving the menu item data.");
            console.error("Menu item edit error:", error);
        }
    };

    const handleEditCategory = async (categoryData) => {
        const isDuplicate = categories.some(cat => cat.name === categoryData.name && cat.id !== selectedRowData.id);
        if (isDuplicate) {
            message.error("A category with that name already exists!");
            return;
        }

        try {
            const categoryResponse = await updateCategoryById(selectedRowData.id, {
                name: categoryData.name
            });
            message.success("The category data has been saved.");
            setCategories(categories.map(cat => (cat.id === selectedRowData.id ? {
                ...cat, ...categoryResponse.data
            } : cat)));
            setFilteredCategories(categories.map(cat => (cat.id === selectedRowData.id ? {
                ...cat, ...categoryResponse.data
            } : cat)));
            setIsEditModalOpen(false);
            setSelectedRowData(null);
        } catch (error) {
            message.error("An error occurred while saving category data.");
            console.error("Menu category edit error:", error);
        }
    };

    const handleRemoveMenuItem = async () => {
        try {
            await deleteMenuItemById(selectedRowData.id);
            message.success("Menu item removed.");
            setMenuItems(prev => prev.filter(item => item.id !== selectedRowData.id));
            setIsEditModalOpen(false);
            setSelectedRowData(null)
        } catch (error) {
            message.error("An error occurred while deleting a menu item.");
            console.error("Menu item remove error:", error);
        }
    };

    const handleRemoveCategory = async () => {
        const filteredItems = menuItems.filter(item => item.category_id === selectedRowData.id);
        if (filteredItems.length !== 0) {
            message.error("You cannot delete categories that contain items.");
            return;
        }
        try {
            await deleteCategoryById(selectedRowData.id);
            message.success("Category deleted.");
            setCategories(prev => prev.filter(cat => cat.id !== selectedRowData.id));
            setFilteredCategories(prev => prev.filter(cat => cat.id !== selectedRowData.id));
            setIsEditModalOpen(false);
            setSelectedRowData(null);
        } catch (error) {
            message.error("An error occurred while deleting the category.");
            console.error("Menu category remove error:", error);
        }
    };

    const handleAddMenuItem = async (menuItemData) => {
        const isDuplicate = menuItems.some(item => item.name === menuItemData.name);
        if (isDuplicate) {
            message.error("A menu item with that name already exists!");
            return;
        }

        try {
            const image =
                menuItemData.newImage && menuItemData.newImage.length > 0
                    ? menuItemData.newImage[0].originFileObj : null;

            const newMenuItemResponse = await addMenuItem({
                name: menuItemData.name,
                description: menuItemData.description,
                price: menuItemData.price,
                cost: menuItemData.cost,
                type: menuItemData.type,
                weight: menuItemData.weight,
                available: menuItemData.available,
                category_id: menuItemData.category_id,
            }, image);
            message.success("The menu item data has been saved.");
            setMenuItems([newMenuItemResponse.data, ...menuItems]);
            setIsAddModalOpen(false);
        } catch (error) {
            message.error("An error occurred while creating a new menu item.");
            console.error("Menu item creation error:", error);
        }
    };

    const handleAddCategory = async (categoryData) => {
        const isDuplicate = categories.some(cat => cat.name === categoryData.name);
        if (isDuplicate) {
            message.error("A category with that name already exists!");
            return;
        }

        try {
            const newCategoryResponse = await addCategory({
                name: categoryData.name
            });
            message.success("The category data has been saved.");
            setCategories([newCategoryResponse.data, ...categories]);
            setFilteredCategories([newCategoryResponse.data, ...filteredCategories]);
            setIsAddModalOpen(false);
            categoryForm.resetFields();
        } catch (error) {
            message.error("An error occurred while creating a new category.");
            console.error("Menu category creation error:", error);
        }
    };

    const handleSearch = (value) => {
        setSearchQuery(value);
        if (value.trim() === '') {
            setFilteredCategories(categories);
        } else {
            const lowercasedValue = value.toLowerCase();
            const matchedItems = menuItems.filter(item => item.name.toLowerCase().includes(lowercasedValue));
            const matchedCategoryIds = new Set(matchedItems.map(item => item.category_id));
            setFilteredCategories(categories.filter(category => matchedCategoryIds.has(category.id)));
        }
    };

    const expandedRowRender = (category) => {
        const filteredItems = menuItems.filter(item => item.category_id === category.id);
        return <Table columns={menuItemColumns} dataSource={filteredItems} pagination={false} rowKey="id"
                      onRow={handleRowClick}/>;
    };

    if (loading) return <LoadingSpinner/>;

    return (
        <div className="flex justify-center mb-4 my-3 mx-2 min-h-screen">
            <div className="bg-gray-100 rounded-lg shadow w-full lg:w-3/5 flex flex-col gap-3 pb-4">
                <Title level={2} className="text-center">Menu</Title>
                <Search
                    placeholder="Wyszukaj pozycji menu..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    enterButton
                    className="lg:w-4/6 self-center px-4"
                />
                <div className="flex gap-3 justify-center">
                    <Button color="blue" variant="solid" className="w-1/3 self-center"
                            onClick={() => {
                                setIsAddModalOpen(true);
                                setAddType('menuItem');
                            }}>
                        Add a menu item
                    </Button>
                    <Button color="blue" variant="solid" className="w-1/3 self-center"
                            onClick={() => {
                                setIsAddModalOpen(true);
                                setAddType('category');
                                categoryForm.setFieldsValue({name: null});
                            }}>
                        Add a category
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <Table
                        dataSource={filteredCategories}
                        columns={categoryColumns}
                        expandable={{expandedRowRender}}
                        rowKey={(record) => record.id}
                        onRow={handleRowClick}
                        pagination={false}
                        locale={{emptyText: 'The menu items will appear here'}}
                    />
                </div>
            </div>
            {selectedRowData &&
                <Modal
                    title={<div className="text-xl text-center">{selectedRowData.name}</div>}
                    centered
                    open={isEditModalOpen}
                    onCancel={() => {
                        setIsEditModalOpen(false);
                    }}
                    className="font-mono"
                    footer={null}
                >
                    <div className="flex flex-col justify-center">
                        {selectedRowData.rowType === 'menuItem'
                            ? <>
                                <MenuItemForm isEditing={true} menuItemData={selectedRowData} categories={categories}
                                              onSubmit={handleEditMenuItem}/>
                                <Button color="danger" variant="solid" className="w-full mt-2 self-center"
                                        onClick={handleRemoveMenuItem}>
                                    Delete
                                </Button>
                            </>
                            : <>
                                <Form
                                    form={categoryForm}
                                    initialValues={selectedRowData}
                                    onFinish={handleEditCategory}
                                    layout="vertical"
                                >
                                    <Form.Item
                                        name="name"
                                        label="Nazwa"
                                        rules={[{
                                            required: true,
                                            min: 1,
                                            max: 50,
                                            message: 'The category name must contain between 1 and 50 characters!'
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
                                        onClick={handleRemoveCategory}>
                                    Delete
                                </Button>
                            </>
                        }
                    </div>
                </Modal>
            }
            <Modal
                title={<div
                    className="text-xl text-center">New {addType === 'menuItem' ? 'menu item' : 'category'}</div>}
                centered
                open={isAddModalOpen}
                onCancel={() => {
                    setIsAddModalOpen(false);
                }}
                className="font-mono"
                footer={null}
            >
                <div className="flex flex-col justify-center">
                    {addType === 'menuItem'
                        ? <MenuItemForm isEditing={false} onSubmit={handleAddMenuItem} categories={categories}/>
                        : <Form
                            form={categoryForm}
                            initialValues={selectedRowData}
                            onFinish={handleAddCategory}
                            layout="vertical"
                        >
                            <Form.Item
                                name="name"
                                label="Nazwa"
                                rules={[{
                                    required: true,
                                    min: 1,
                                    max: 50,
                                    message: 'The category name must contain between 1 and 50 characters!'
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
                    }
                </div>
            </Modal>
        </div>
    );
};

export default MenuManagement;
