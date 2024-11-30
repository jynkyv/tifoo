const FreePlanIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-[#657786]"
  >
    <path
      d="M8 1.33334C4.32 1.33334 1.33333 4.32001 1.33333 8.00001C1.33333 11.68 4.32 14.6667 8 14.6667C11.68 14.6667 14.6667 11.68 14.6667 8.00001C14.6667 4.32001 11.68 1.33334 8 1.33334ZM6.66667 11.3333L3.33333 8.00001L4.27333 7.06001L6.66667 9.44668L11.7267 4.38668L12.6667 5.33334L6.66667 11.3333Z"
      fill="currentColor"
    />
  </svg>
);

const AIPlanIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-[#1DA1F2]"
  >
    <path
      d="M8 1.33334C4.32 1.33334 1.33333 4.32001 1.33333 8.00001C1.33333 11.68 4.32 14.6667 8 14.6667C11.68 14.6667 14.6667 11.68 14.6667 8.00001C14.6667 4.32001 11.68 1.33334 8 1.33334Z"
      fill="currentColor"
      opacity="0.2"
    />
    <path
      d="M8 3.33334C6.52724 3.33334 5.33333 4.52725 5.33333 6.00001C5.33333 7.47277 6.52724 8.66668 8 8.66668C9.47276 8.66668 10.6667 7.47277 10.6667 6.00001C10.6667 4.52725 9.47276 3.33334 8 3.33334Z"
      fill="currentColor"
    />
    <path
      d="M8 9.33334C6.14095 9.33334 4.66667 10.8076 4.66667 12.6667V13.3333H11.3333V12.6667C11.3333 10.8076 9.85905 9.33334 8 9.33334Z"
      fill="currentColor"
    />
  </svg>
);

interface PlanIconProps {
  type: "free" | "monthly_ai" | "yearly_ai";
}

const PlanIcon: React.FC<PlanIconProps> = ({ type }) => {
  return type === "free" ? <FreePlanIcon /> : <AIPlanIcon />;
};

export default PlanIcon;
