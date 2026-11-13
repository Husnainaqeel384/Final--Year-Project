import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Bar, Line } from 'react-chartjs-2';
import { formatMoney, formatMonth } from '../../lib/format';
import { baseChartOptions, readChartColors } from './chartTheme';

function useChartColors() {
  const theme = useSelector((state) => state.ui.theme);
  // `theme` is the signal: the token values live in CSS and change when it does.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => readChartColors(), [theme]);
}

function LegendKey({ color, label }) {
  return (
    <span className="text-ink-2 inline-flex items-center gap-1.5 text-xs">
      <span className="h-0.5 w-3.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

/** Tooltips only appear on hover, so each chart also offers its numbers as a table. */
export function ChartTable({ caption, columns, rows }) {
  return (
    <details className="mt-3">
      <summary className="text-ink-3 hover:text-ink-2 text-xs">View as table</summary>
      <div className="mt-2 max-h-56 overflow-auto">
        <table className="tabular w-full text-left text-xs">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="text-ink-3">
              {columns.map((column) => (
                <th key={column} scope="col" className="py-1 pr-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]} className="border-line text-ink-2 border-t">
                {row.map((cell, index) => (
                  <td key={index} className="py-1 pr-3">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

export function CashFlowChart({ trend, currency }) {
  const colors = useChartColors();
  const labels = trend.map((point) => formatMonth(point.month, 'short'));

  const series = (label, key, color) => ({
    label,
    data: trend.map((point) => point[key]),
    borderColor: color,
    backgroundColor: color,
    borderWidth: 2,
    tension: 0.3,
    pointRadius: (context) => (context.dataIndex === trend.length - 1 ? 4 : 0),
    pointBorderColor: colors.surface,
    pointBorderWidth: 2,
    pointHoverRadius: 5,
  });

  const base = baseChartOptions(colors);
  const options = {
    ...base,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      ...base.plugins,
      tooltip: {
        ...base.plugins.tooltip,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${formatMoney(context.parsed.y, currency)}`,
        },
      },
    },
  };

  return (
    <>
      <div className="mb-2 flex gap-4">
        <LegendKey color={colors.series1} label="Income" />
        <LegendKey color={colors.series2} label="Spending" />
      </div>
      <div className="h-64">
        <Line
          data={{
            labels,
            datasets: [
              series('Income', 'income', colors.series1),
              series('Spending', 'spent', colors.series2),
            ],
          }}
          options={options}
          aria-label="Line chart of income and spending by month"
          role="img"
        />
      </div>
      <ChartTable
        caption="Income and spending by month"
        columns={['Month', 'Income', 'Spending']}
        rows={trend.map((point) => [
          formatMonth(point.month),
          formatMoney(point.income, currency),
          formatMoney(point.spent, currency),
        ])}
      />
    </>
  );
}

export function CategoryBarChart({ categories, currency }) {
  const colors = useChartColors();
  const base = baseChartOptions(colors);

  const options = {
    ...base,
    indexAxis: 'y',
    plugins: {
      ...base.plugins,
      tooltip: {
        ...base.plugins.tooltip,
        displayColors: false,
        callbacks: { label: (context) => formatMoney(context.parsed.x, currency) },
      },
    },
    scales: {
      x: { ...base.scales.y, position: 'bottom' },
      y: {
        grid: { display: false },
        border: { color: colors.grid },
        ticks: { color: colors.ink2, font: { family: 'Inter Variable', size: 12 } },
      },
    },
  };

  return (
    <>
      <div style={{ height: Math.max(categories.length * 36 + 32, 140) }}>
        <Bar
          data={{
            labels: categories.map((item) => item.category),
            datasets: [
              {
                label: 'Spent',
                data: categories.map((item) => item.spent),
                backgroundColor: colors.series1,
                maxBarThickness: 20,
                borderRadius: { topRight: 4, bottomRight: 4 },
                borderSkipped: false,
              },
            ],
          }}
          options={options}
          aria-label="Bar chart of spending by category"
          role="img"
        />
      </div>
      <ChartTable
        caption="Spending by category"
        columns={['Category', 'Spent', 'Planned']}
        rows={categories.map((item) => [
          item.category,
          formatMoney(item.spent, currency),
          formatMoney(item.planned, currency),
        ])}
      />
    </>
  );
}
