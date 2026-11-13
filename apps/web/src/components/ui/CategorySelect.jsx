import { useState } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { Input, Select } from './Field';

const OTHER = '__other__';

/**
 * Picks from the shared category list, or "Other" to type any name, so a
 * budget can track something the list doesn't cover (for example "Car wash").
 */
export function CategorySelect({ label = 'Category', value, onChange, required = true }) {
  const { categories } = useCategories();
  const [typing, setTyping] = useState(false);

  const known = new Set(categories.flatMap((category) => category.subcategories.map((sub) => sub.name)));
  // A saved custom name (when editing) opens in the text box rather than the list.
  const custom = typing || (value !== '' && categories.length > 0 && !known.has(value));

  if (custom) {
    return (
      <div>
        <Input
          label={label}
          required={required}
          maxLength={100}
          autoFocus={typing}
          placeholder="Type a category name"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="text-accent-text mt-1 text-xs font-medium"
          onClick={() => {
            setTyping(false);
            onChange('');
          }}
        >
          Choose from the list instead
        </button>
      </div>
    );
  }

  return (
    <Select
      label={label}
      value={value}
      required={required}
      onChange={(event) => {
        if (event.target.value === OTHER) {
          setTyping(true);
          onChange('');
        } else {
          onChange(event.target.value);
        }
      }}
    >
      <option value="">Choose a category</option>
      {categories.map((category) => (
        <optgroup key={category.id} label={category.name}>
          {category.subcategories.map((subcategory) => (
            <option key={subcategory.id} value={subcategory.name}>
              {subcategory.name}
            </option>
          ))}
        </optgroup>
      ))}
      <option value={OTHER}>Other (type your own)…</option>
    </Select>
  );
}
