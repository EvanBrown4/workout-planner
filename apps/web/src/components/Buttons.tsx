// components/Button.tsx

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger";
  onClick?: () => void;
};

export function Button({
  children,
  className = "",
  type = "button",
  variant = "primary",
  onClick,
}: ButtonProps) {
  const baseClasses =
    "px-4 py-2 rounded-md font-medium transition-colors cursor-pointer";

  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${className} ${variantClasses[variant]}`}
    >
      {children}
    </button>
  );
}