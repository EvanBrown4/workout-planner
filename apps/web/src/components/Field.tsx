type FieldProps = {
  id: string;
  label: string;
  type: React.HTMLInputTypeAttribute;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  min?: number;
  max?: number;
  step?: number | "any";
};

export function Field({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  min,
  max,
  step,
}: FieldProps) {
  return (
    <section>
      <label htmlFor={id} className="block text-sm text-gray-600 mb-1">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded-md outline-none text-sm transition duration-150 ease-in-out"
      />
    </section>
  );
}