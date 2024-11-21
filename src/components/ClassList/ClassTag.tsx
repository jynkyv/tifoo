import type { ClassTagProps } from "@/types";
import Switch from "@/components/Common/Switch";
import React, { useEffect, useState } from "react";

const ClassTag: React.FC<ClassTagProps> = ({
  className,
  element,
  onToggle,
  onRemove,
}) => {
  const [isChecked, setIsChecked] = useState(true);

  useEffect(() => {
    setIsChecked(element.classList.contains(className));
  }, [className, element]);

  const handleChange = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    onToggle(className, newCheckedState);
  };

  return (
    <div className="bg-gray-50/50 px-2 py-1 rounded-lg text-xs flex items-center justify-between shadow-sm transition-all duration-200 border border-gray-100">
      <div className="flex items-center gap-1.5 font-mono">
        <Switch
          checked={isChecked}
          onChange={handleChange}
        />
        <span className="text-gray-600 font-medium">{className}</span>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          onRemove(className);
        }}
        className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors duration-200 w-4 h-4 flex items-center justify-center"
      >
        ×
      </button>
    </div>
  );
};

export default ClassTag;
