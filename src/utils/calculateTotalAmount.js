const calculateTotalAmount = (orderItems) => {
    return orderItems.reduce((sum, item) => {
        const itemTotal = item.type === "by_quantity"
            ? Math.floor(item.quantity * Math.round(item.price * 100)) / 100
            : Math.floor((item.quantity / item.weight) * Math.round(item.price * 100)) / 100;
        return sum + itemTotal;
    }, 0).toFixed(2);
};

export default calculateTotalAmount;