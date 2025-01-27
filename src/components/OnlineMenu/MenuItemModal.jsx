import React from 'react';
import { Modal } from 'antd';

const MenuItemModal = ({ selectedItem, onClose }) => (
    <Modal
        open={!!selectedItem}
        onCancel={onClose}
        footer={null}
        getContainer={false}
        centered
        className="bg-gray-100 font-mono rounded-lg"
    >
        {selectedItem && (
            <div className="flex flex-col items-center text-base">
                <img src={selectedItem.image} alt={selectedItem.name} className="w-full rounded-lg max-w-xs aspect-square object-cover"/>
                <div className="mt-4 text-lg font-semibold">{selectedItem.name}</div>
                <div className="mt-2 text-gray-600">{selectedItem.description}</div>
                <div className="mt-2 text-blue-600 font-bold">
                    {selectedItem.price} zł {selectedItem.type === 'by_weight' ? 'za 100g' : ''}
                </div>
            </div>
        )}
    </Modal>
);

export default MenuItemModal;