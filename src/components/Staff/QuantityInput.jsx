import {Button, InputNumber} from "antd";

const QuantityInput = ({value, onChangeBtns, onConfirm, className, showCompact = false}) => {
    return (
        <div className="flex items-center gap-2">
            <Button className="size-7" onClick={(e) => {
                e.stopPropagation();
                onChangeBtns(Math.max(0, value - 1));
            }}>-</Button>

            {showCompact ? (
                <span className="block sm:hidden">
                    {value.toString().length > 5 ? value.toString().slice(0, 2) + '..' + value.toString().slice(-1) : value}
                </span>
            ) : null}

            <InputNumber
                type="number"
                controls={false}
                min={0}
                max={9999999}
                value={value}
                className={`${className} ${showCompact ? "hidden sm:block" : ""}`}
                onPressEnter={(e) => onConfirm(parseInt(e.target.value))}
                onBlur={(e) => onConfirm(parseInt(e.target.value))}
                onClick={(e) => e.stopPropagation()}
            />

            <Button className="size-7" onClick={(e) => {
                e.stopPropagation();
                onChangeBtns(value + 1);
            }}>+</Button>
        </div>
    );
};

export default QuantityInput;