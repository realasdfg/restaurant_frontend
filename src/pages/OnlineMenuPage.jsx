import React, {useEffect, useRef, useState} from 'react';
import {Layout, Typography, Divider, Input, Menu} from 'antd';
import 'tailwindcss/tailwind.css';
import {fetchCategories, fetchMenuItems} from "../services/api.js";
import OnlineMenuHeader from "../components/OnlineMenu/OnlineMenuHeader.jsx";
import OnlineMenuFooter from "../components/OnlineMenu/OnlineMenuFooter.jsx";
import LoadingSpinner from "../components/shared/LoadingSpinner.jsx";
import MenuItemModal from "../components/OnlineMenu/MenuItemModal.jsx";

const {Content} = Layout;
const {Title} = Typography;
const {Search} = Input;

const OnlineMenuPage = () => {
    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);

    const categoryRefs = useRef({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, itemsRes] = await Promise.all([
                    fetchCategories(),
                    fetchMenuItems(true)
                ]);

                setCategories(categoriesRes.data);
                setMenuItems(itemsRes.data);
                setFilteredItems(itemsRes.data);

                const refs = {};
                categoriesRes.data.forEach(category => {
                    refs[category.id] = React.createRef();
                });
                categoryRefs.current = refs;
            } catch (error) {
                console.error('Error fetching data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSearch = (value) => {
        setSearchQuery(value);
        if (value.trim() === '') {
            setFilteredItems(menuItems);
        } else {
            const lowercasedValue = value.toLowerCase();
            setFilteredItems(
                menuItems.filter(item =>
                    item.name.toLowerCase().includes(lowercasedValue) ||
                    item.description.toLowerCase().includes(lowercasedValue)
                )
            );
        }
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
    };

    const handleModalClose = () => {
        setSelectedItem(null);
    };

    const handleCategoryClick = (categoryId) => {
        const categoryElement = categoryRefs.current[categoryId]?.current;
        if (categoryElement) {
            categoryElement.scrollIntoView({behavior: "smooth", block: "start"});
        }
    };

    if (loading) return <LoadingSpinner/>;

    return (
        <div className="bg-gray-100 font-mono">
            <OnlineMenuHeader categories={categories} onCategoryClick={handleCategoryClick}/>
            <div className="flex justify-center p-3">
                <div className="flex lg:w-3/4 gap-3">
                    <Menu
                        mode="inline"
                        className="bg-gray-200 font-mono rounded-lg w-1/5 hidden lg:block pt-4"
                        onClick={(e) => handleCategoryClick(e.key)}
                        items={[
                            {
                                key: "header",
                                label: <div className="text-xl font-bold text-center text-black mb-2">Kategorie</div>,
                                type: "group"
                            },
                            ...categories.map(category => ({
                                key: category.id,
                                label: '• ' + category.name
                            }))
                        ]}
                        selectedKeys={[]}
                    />

                    <Content className="flex w-full min-h-screen">
                        <div className="bg-gray-200 p-5 rounded-lg w-full">
                            <Search
                                placeholder="Wyszukaj pozycji..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                enterButton
                                className="w-full mb-4"
                            />
                            {categories.map((category) => {
                                const categoryItems = filteredItems.filter((item) => item.category_id === category.id);
                                if (categoryItems.length === 0) return null;

                                return (
                                    <div key={category.id} ref={categoryRefs.current[category.id]}>
                                        <Title level={3}>{category.name}</Title>
                                        <div
                                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                            {categoryItems.map((item) => (
                                                <div key={item.id}
                                                     className="flex flex-col justify-between border rounded-lg p-2 bg-gray-100 shadow hover:shadow-lg transition-shadow cursor-pointer"
                                                     onClick={() => handleItemClick(item)}>
                                                    <div>
                                                        <img src={item.image} alt={item.name}
                                                             className="w-full rounded-lg aspect-square object-cover"/>
                                                        <div
                                                            className="mt-2 font-semibold text-lg line-clamp-2 m-1">{item.name}</div>
                                                        <div
                                                            className="text-gray-600 line-clamp-3 m-1">{item.description}</div>
                                                    </div>
                                                    <div
                                                        className="text-blue-600 font-bold mt-2 m-1 flex justify-between">
                                                        <div>
                                                            {item.price} zł {item.type === 'by_weight' ? `za ${item.weight}g` : ''}
                                                        </div>
                                                        {item.type === 'by_quantity' && <div>{item.weight}g</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Divider/>
                                    </div>
                                );
                            })}
                        </div>
                        <MenuItemModal selectedItem={selectedItem} onClose={handleModalClose}/>
                    </Content>
                </div>
            </div>
            <OnlineMenuFooter/>
        </div>
    );

};

export default OnlineMenuPage;
