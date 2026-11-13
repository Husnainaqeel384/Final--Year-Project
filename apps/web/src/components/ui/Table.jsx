/** Scrolls inside its own box so a wide table never makes the whole page scroll sideways. */
export function Table({ head, children }) {
  return (
    // relative: keeps any visually hidden labels inside this scroll box, not the page.
    <div className="relative overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-line text-ink-3 border-b text-xs">
            {head.map((column) => (
              <th
                key={column.label}
                scope="col"
                className={`px-5 py-3 font-medium whitespace-nowrap ${column.right ? 'text-right' : ''}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-line divide-y">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ right, className = '', children }) {
  return (
    <td className={`px-5 py-3 ${right ? 'tabular text-right whitespace-nowrap' : ''} ${className}`}>
      {children}
    </td>
  );
}
