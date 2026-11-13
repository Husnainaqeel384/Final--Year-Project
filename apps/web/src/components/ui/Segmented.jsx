/** A row of mutually exclusive choices, built on real radio inputs so arrow keys work. */
export function Segmented({ legend, name, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="text-ink-2 mb-1.5 text-[13px] font-medium">{legend}</legend>
      <div className="bg-surface-2 grid gap-1 rounded-lg p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer items-center justify-center rounded-md py-1.5 text-sm transition-colors ${
              value === option.value ? 'bg-surface text-ink font-medium shadow-sm' : 'text-ink-2 hover:text-ink'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
