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
        transition-colors duration-200 ease-in-out
        ${checked ? "!bg-[#1DA1F2]" : "!bg-gray-200"}
        ${className}
      `}
    >
      <span className="sr-only">Toggle</span>
      <span
        className={`
          inline-block h-2.5 w-2.5 
          transform rounded-full 
          bg-white 
          transition-transform duration-200 ease-in-out
          ${checked ? "translate-x-2.5" : "translate-x-0.5"}
        `}
      />
    </button>
  );
};

export default Switch;
