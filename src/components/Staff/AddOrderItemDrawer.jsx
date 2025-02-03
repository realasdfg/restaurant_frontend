import React, { useEffect, useState, useRef } from "react";
import { Button, List, Input, Drawer, Modal } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import { fetchCategories, fetchMenuItems } from "../../services/api";
import LoadingSpinner from "../shared/LoadingSpinner.jsx";

const AddOrderItemDrawer = ({ visible, onClose, onAddItem }) => {
    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const [weightModalVisible, setWeightModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [weight, setWeight] = useState("");

    const weightInputRef = useRef(null);

    useEffect(() => {
        if (visible) {
            loadData();
        }
    }, [visible]);

    useEffect(() => {
        if (weightModalVisible && weightInputRef.current) {
            setTimeout(() => weightInputRef.current.focus(), 100);
        }
    }, [weightModalVisible]);

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

    const handleAddItem = (item) => {
        if (item.type === "by_quantity") {
            onAddItem(item.id, 1);
        } else if (item.type === "by_weight") {
            setSelectedItem(item);
            setWeight("");
            setWeightModalVisible(true);
        }
    };

    const handleConfirmWeight = () => {
        const weightValue = parseInt(weight);
        if (isNaN(weightValue) || weightValue <= 0) return;

        onAddItem(selectedItem.id, weightValue);
        setWeightModalVisible(false);
        setSelectedItem(null);
    };

    const handleWeightKeyPress = (e) => {
        if (e.key === "Enter") {
            handleConfirmWeight();
        }
    };

    const filteredMenuItems = searchQuery
        ? menuItems.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : selectedCategory
            ? menuItems.filter((item) => item.category_id === selectedCategory.id)
            : [];

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <Drawer
                title="Dodaj pozycję"
                placement="bottom"
                open={visible}
                onClose={onClose}
                size={"large"}
                className="h-[80vh] overflow-hidden"
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
                            className={`text-gray-500 cursor-pointer ${
                                searchQuery ? "visible" : "invisible"
                            }`}
                            onClick={() => setSearchQuery("")}
                        />
                    }
                />

                <div className="h-[calc(100%-60px)] overflow-auto">
                    {!searchQuery && !selectedCategory ? (
                        <List
                            bordered
                            dataSource={categories}
                            renderItem={(category) => (
                                <List.Item
                                    onClick={() => setSelectedCategory(category)}
                                    className="cursor-pointer"
                                >
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
                                locale={{ emptyText: 'Błąd wyszukiwania' }}
                                renderItem={(item) => (
                                    <List.Item
                                        onClick={() => handleAddItem(item)}
                                        className="cursor-pointer flex justify-between"
                                    >
                                        <span>{item.name}</span>
                                        <span className="text-gray-600">{item.price} zł</span>
                                    </List.Item>
                                )}
                            />
                        </>
                    )}
                </div>
            </Drawer>

            <Modal
                title="Podaj wagę (g)"
                open={weightModalVisible}
                onCancel={() => setWeightModalVisible(false)}
                onOk={handleConfirmWeight}
            >
                <Input
                    ref={weightInputRef}
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    onKeyDown={handleWeightKeyPress}
                    placeholder="Wprowadź wagę w gramach"
                    min={1}
                />
            </Modal>
        </div>
    );
};

export default AddOrderItemDrawer;
