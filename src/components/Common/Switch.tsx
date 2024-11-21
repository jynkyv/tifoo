import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  className = "",
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        group inline-flex h-3.5 w-6 
        items-center rounded-full 
        !bg-gray-200 transition data-[checked]:!bg-[#1DA1F2]
        ${className}
      `}
    >
      <span className="sr-only">Toggle</span>
      <span
        className="translate-x-0.5 h-2.5 w-2.5 rounded-full bg-white transition-transform duration-200 ease-in-out group-data-[checked]:translate-x-2.5 shadow-sm"
      />
    </button>
  );
};

export default Switch;
