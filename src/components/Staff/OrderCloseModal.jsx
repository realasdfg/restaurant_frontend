import {Button, InputNumber, message, Modal, Table} from "antd";
import React, {useEffect, useRef, useState} from "react";
import {closeOrder} from "../../services/api.js";
import {useNavigate} from "react-router-dom";

const OrderCloseModal = ({open, onCancel, totalAmount, orderId}) => {
    const navigate = useNavigate();
    const [cashAmount, setCashAmount] = useState(0);
    const [cardAmount, setCardAmount] = useState(0);
    const [closestNumbers, setClosestNumbers] = useState([]);

    const cashInputRef = useRef(null);
    const cardInputRef = useRef(null);

    const [isOkDisabled, setIsOkDisabled] = useState(true);

    useEffect(() => {
        let isDisabled = Math.round((cashAmount + cardAmount + Number.EPSILON) * 100) / 100 < totalAmount;
        isDisabled = isDisabled || cashAmount === 0 && cardAmount === 0;
        setIsOkDisabled(isDisabled);
    }, [cashAmount, cardAmount, totalAmount]);

    useEffect(() => {
        const findClosestNumbers = () => {
            const result = new Set();
            result.add(Math.ceil(totalAmount / 50) * 50);
            result.add(Math.ceil(totalAmount / 100) * 100);
            result.add(Math.ceil(totalAmount / 200) * 200);
            result.add(Math.ceil(totalAmount / 500) * 500);
            setClosestNumbers(Array.from(result).sort((a, b) => a - b).slice(0, 4));
        };
        findClosestNumbers();
    }, [totalAmount]);

    const handleConfirm = async () => {
        try {
            let realCashAmount = cashAmount > totalAmount ? totalAmount : cashAmount;
            await closeOrder(orderId, {paid: true, paid_by_card: cardAmount, paid_by_cash: realCashAmount});
            navigate('/orders');
        } catch (error) {
            message.error('Błąd podczas zamknięcia zamówienia');
            console.error('Close order error:', error);
        }
    }

    const handleCashChange = async (value) => {
        value = Math.floor((value + Number.EPSILON) * 100) / 100;
        setCashAmount(value);
        let newCardAmount = Math.round((totalAmount - value + Number.EPSILON) * 100) / 100;
        setCardAmount(newCardAmount > 0 ? newCardAmount : 0);
    };

    const handleCardChange = async (value) => {
        value = Math.floor((value + Number.EPSILON) * 100) / 100;
        if (value > totalAmount) value = totalAmount;
        setCardAmount(value);
        let newCashAmount = Math.round((totalAmount - value + Number.EPSILON) * 100) / 100;
        setCashAmount(newCashAmount > 0 ? newCashAmount : 0);
    };

    const handleInputClick = async (setAmount, inputRef) => {
        if (!cashAmount && !cardAmount) {
            setAmount(parseFloat(totalAmount));
        }
        if (cashAmount === 0 || cardAmount === 0) {
            setAmount(parseFloat(totalAmount));

        }
        setTimeout(() => inputRef.current?.select(), 0);
    };

    return (
        <Modal
            title={<div className="text-xl text-center">Zamknięcie zamówienia</div>}
            centered
            open={open}
            onCancel={onCancel}
            width={380}
            className="font-mono"
            footer={(_, {OkBtn, CancelBtn}) => (
                <div className="flex justify-between">
                    <CancelBtn/>
                    <OkBtn/>
                </div>
            )}
            onOk={handleConfirm}
            okButtonProps={{disabled: isOkDisabled}}
            okText="Zamknij zamówienie"
            cancelText="Anuluj"
        >
            <div className="flex justify-center gap-3 mb-3">
                {closestNumbers.map((value) => (
                    <Button color="blue" variant="outlined" key={value}
                            onClick={() => handleCashChange(value)}>{value}</Button>
                ))}
            </div>

            <Table
                pagination={false}
                showHeader={false}
                bordered
                dataSource={[
                    {
                        key: 'sum',
                        label: <div className="text-base font-bold">Suma:</div>,
                        value: <div className="text-base">{totalAmount} zł</div>,
                    },
                    {
                        key: 'cash',
                        label: <div className="text-base font-bold">Gotówką:</div>,
                        value: (
                            <InputNumber
                                ref={cashInputRef}
                                min={0}
                                value={cashAmount}
                                onChange={handleCashChange}
                                onClick={() => handleInputClick(handleCashChange, cashInputRef)}
                            />
                        ),
                    },
                    {
                        key: 'card',
                        label: <div className="text-base font-bold">Kartą:</div>,
                        value: (
                            <InputNumber
                                ref={cardInputRef}
                                min={0}
                                value={cardAmount}
                                onChange={handleCardChange}
                                onClick={() => handleInputClick(handleCardChange, cardInputRef)}
                            />
                        ),
                    },
                    {
                        key: 'change',
                        label: <div className="text-base font-bold">Reszta:</div>,
                        value:
                            <div
                                className="text-base">{
                                (cashAmount - totalAmount) >= 0 ? Math.round((cashAmount - totalAmount + Number.EPSILON) * 100) / 100 : 0
                            } zł
                            </div>,
                    },
                ]}
                columns={[
                    {dataIndex: 'label', key: 'label'},
                    {dataIndex: 'value', key: 'value'},
                ]}
            />
        </Modal>
    );
};

export default OrderCloseModal;
