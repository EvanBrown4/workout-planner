type SelectProps = {
  id: string;
  label: string;
  value: string | null;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
};

export function Select({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
}: SelectProps) {
  return (
    <section className="space-y-1">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      <select
        id={id}
        name={id}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full
          rounded-lg
          border
          border-gray-300
          bg-white
          px-3
          py-2
          text-gray-900
          shadow-sm
          outline-none
          transition
          focus:border-blue-500
          focus:ring-2
          focus:ring-blue-200
        "
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </section>
  );
}