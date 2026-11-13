import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { formatCompact } from '../../lib/format';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler, Tooltip, Legend);

/** Canvas cannot read CSS variables, so the tokens are resolved each time the theme changes. */
export function readChartColors() {
  const styles = getComputedStyle(document.documentElement);
  const read = (name) => styles.getPropertyValue(name).trim();
  return {
    series1: read('--chart-1'),
    series2: read('--chart-2'),
    grid: read('--chart-grid'),
    axis: read('--chart-axis'),
    surface: read('--chart-surface'),
    ink: read('--ink'),
    ink2: read('--ink-2'),
  };
}

export function baseChartOptions(colors) {
  const tick = { color: colors.axis, font: { family: 'Inter Variable', size: 11 } };
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: colors.ink,
        titleColor: colors.surface,
        bodyColor: colors.surface,
        padding: 10,
        cornerRadius: 8,
        boxPadding: 4,
        usePointStyle: true,
      },
    },
    scales: {
      // Slanted labels are hard to read; on narrow screens Chart.js skips some instead.
      x: { grid: { display: false }, border: { color: colors.grid }, ticks: { ...tick, maxRotation: 0, autoSkipPadding: 12 } },
      y: {
        beginAtZero: true,
        grid: { color: colors.grid },
        border: { display: false },
        ticks: { ...tick, maxTicksLimit: 5, callback: (value) => formatCompact(value) },
      },
    },
  };
}
