import React, {useEffect, useState, useRef} from "react";
import {Button, List, Input, Drawer, Modal, InputNumber} from "antd";
import {CloseCircleOutlined} from "@ant-design/icons";
import {fetchCategories, fetchMenuItems} from "../../services/api";

const AddOrderItemDrawer = ({visible, onClose, onAddItem}) => {
    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

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
        try {
            const [categoriesResponse, menuItemsResponse] = await Promise.all([
                fetchCategories(),
                fetchMenuItems(true),
            ]);
            setCategories(categoriesResponse.data);
            setMenuItems(menuItemsResponse.data);
            setSearchQuery("");
            setSelectedCategory(null);
        } catch (error) {
            console.error("Error fetching data:", error);
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

    const filteredMenuItems = searchQuery
        ? menuItems.filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : selectedCategory
            ? menuItems.filter((item) => item.category_id === selectedCategory.id)
            : [];

    return (
        <>
            <Drawer
                title="Dodaj pozycję"
                placement="bottom"
                open={visible}
                onClose={onClose}
                size="large"
                styles={{
                    body: {backgroundColor: "rgb(243, 244, 246)"},
                    header: {backgroundColor: "rgb(249, 250, 251)"}
                }}
            >
                <div className="flex flex-col items-center">
                    <div className="w-full lg:w-3/6 xl:w-2/5">
                        <Input
                            placeholder="Wyszukaj pozycję..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setSelectedCategory(null);
                            }}
                            className="mb-3 w-full bg-gray-50"
                            suffix={
                                <CloseCircleOutlined
                                    className={`text-gray-500 cursor-pointer ${searchQuery ? "visible" : "invisible"}`}
                                    onClick={() => setSearchQuery("")}
                                />
                            }
                        />

                        {!searchQuery && !selectedCategory ? (
                            <List
                                bordered
                                className="w-full"
                                dataSource={categories}
                                renderItem={(category) => (
                                    <List.Item onClick={() => setSelectedCategory(category)}
                                               className="cursor-pointer bg-gray-50">
                                        {category.name}
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <>
                                {!searchQuery && (
                                    <Button onClick={() => setSelectedCategory(null)}
                                            className="mb-2 w-full bg-gray-50">
                                        ← Back
                                    </Button>
                                )}

                                <List
                                    bordered
                                    className="w-full"
                                    dataSource={filteredMenuItems}
                                    locale={{emptyText: "Search error"}}
                                    renderItem={(item) => (
                                        <List.Item onClick={() => handleAddItem(item)}
                                                   className="cursor-pointer bg-gray-50">
                                            <span>{item.name}</span>
                                            <span className="text-gray-600">{item.price} $</span>
                                        </List.Item>
                                    )}
                                />
                            </>
                        )}
                    </div>
                </div>
            </Drawer>


            <Modal
                title="Podaj wagę (g)"
                centered
                open={weightModalVisible}
                onCancel={() => setWeightModalVisible(false)}
                onOk={handleConfirmWeight}
                footer={(_, {OkBtn, CancelBtn}) => (
                    <div className="flex justify-between">
                        <CancelBtn/>
                        <OkBtn/>
                    </div>
                )}
                okText="Dodaj"
                cancelText="Anuluj"
            >
                <InputNumber
                    ref={weightInputRef}
                    type="number"
                    value={weight}
                    onChange={(value) => setWeight(value)}
                    onPressEnter={handleConfirmWeight}
                    placeholder="Wprowadź wagę w gramach"
                    min={1}
                    max={9999999}
                    className="w-full"
                />
            </Modal>
        </>
    );
};

export default AddOrderItemDrawer;
