import React, {useEffect, useRef, useState} from "react";
import {Button, List, Input, Drawer} from "antd";
import {CloseCircleOutlined} from "@ant-design/icons";
import {fetchCategories, fetchMenuItems} from "../../services/api";
import LoadingSpinner from "../shared/LoadingSpinner.jsx";

const AddOrderItemDrawer = ({visible, onClose, onAddItem}) => {
    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            loadData();
        }
    }, [visible]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [categoriesResponse, menuItemsResponse] = await Promise.all([
                fetchCategories(),
                fetchMenuItems(),
            ]);
            setCategories(categoriesResponse.data);
            setMenuItems(menuItemsResponse.data);
            setSearchQuery("");
            setSelectedCategory(null);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMenuItems = searchQuery
        ? menuItems.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : selectedCategory
            ? menuItems.filter((item) => item.category_id === selectedCategory.id)
            : [];

    if (loading) return <LoadingSpinner/>;

    return (
        <div >
            <Drawer
                title="Dodaj pozycję"
                placement="bottom"
                open={visible}
                onClose={onClose}
                size={'large'}
            >
                <Input
                    placeholder="Wyszukaj pozycję..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSelectedCategory(null);
                    }}
                    className="mb-3"
                    suffix={
                        <CloseCircleOutlined
                            className={`text-gray-500 cursor-pointer ${searchQuery ? 'visible' : 'invisible'}`}
                            onClick={() => setSearchQuery("")}
                        />
                    }
                />

                {!searchQuery && !selectedCategory ? (
                    <List
                        bordered
                        dataSource={categories}
                        renderItem={(category) => (
                            <List.Item onClick={() => setSelectedCategory(category)} className="cursor-pointer">
                                {category.name}
                            </List.Item>
                        )}
                    />
                ) : (
                    <>
                        {!searchQuery && (
                            <Button onClick={() => setSelectedCategory(null)} className="mb-2">
                                ← Wróć
                            </Button>
                        )}

                        <List
                            bordered
                            dataSource={filteredMenuItems}
                            renderItem={(item) => (
                                <List.Item
                                    onClick={() => onAddItem(item)}
                                    className="cursor-pointer flex justify-between"
                                >
                                    <span>{item.name}</span>
                                    <span className="text-gray-600">{item.price} zł</span>
                                </List.Item>
                            )}
                        />
                    </>
                )}
            </Drawer>
        </div>
    );
};

export default AddOrderItemDrawer;
