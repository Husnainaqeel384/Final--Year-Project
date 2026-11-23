import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LuChartColumn, LuFileSpreadsheet, LuFileText } from 'react-icons/lu';
import { fetchReport, fetchReportMonths } from '../../api/financeApi';
import { downloadFile, getErrorMessage } from '../../api/client';
import { setError, setLoading, setMonths, setReport } from '../../redux/features/reportSlice';
import { useWorkspace } from '../../hooks/useWorkspace';
import { formatMoney, formatMonth } from '../../lib/format';
import { Card, CardHeader, PageHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState, ErrorState, PageLoader } from '../../components/ui/Feedback';
import { Table, Td } from '../../components/ui/Table';
import { CategoryBarChart } from '../../components/charts/Charts';
import { MonthInsights } from '../../components/ai/MonthInsights';

function Compare({ label, current, previous, currency }) {
  return (
    <div className="border-line border-b py-3 last:border-0">
      <p className="text-ink-2 text-[13px]">{label}</p>
      <p className="mt-0.5 flex items-baseline justify-between gap-3">
        <span className="text-lg font-semibold tracking-tight">{formatMoney(current, currency)}</span>
        {previous !== undefined && (
          <span className="text-ink-3 tabular text-xs">Previous: {formatMoney(previous, currency)}</span>
        )}
      </p>
    </div>
  );
}

function Reports() {
  const dispatch = useDispatch();
  const { months, report, loading, error } = useSelector((state) => state.report);
  const { activeId, currency } = useWorkspace();
  const [month, setMonth] = useState('');

  useEffect(() => {
    const loadMonths = async () => {
      try {
        dispatch(setLoading());
        const available = await fetchReportMonths();
        dispatch(setMonths(available));
        setMonth(available[0] ?? '');
      } catch (err) {
        dispatch(setError(getErrorMessage(err)));
      }
    };
    loadMonths();
  }, [dispatch, activeId]);

  useEffect(() => {
    if (!month) return;
    const loadReport = async () => {
      try {
        dispatch(setLoading());
        dispatch(setReport(await fetchReport(month)));
      } catch (err) {
        dispatch(setError(getErrorMessage(err)));
      }
    };
    loadReport();
  }, [dispatch, month]);

  const download = (format) =>
    downloadFile(
      format === 'pdf' ? `/integrations/reports/${month}.pdf` : `/integrations/export/budget.xlsx?month=${month}`,
      `budget-report-${month}.${format}`,
    ).catch((err) => toast.error(getErrorMessage(err)));

  const showReport = report && report.month === month;
  const spentItems = showReport
    ? report.items
        .map((item) => ({ category: item.categoryName, spent: item.spent, planned: item.amount }))
        .filter((item) => item.spent > 0)
        .sort((a, b) => b.spent - a.spent)
    : [];

  return (
    <>
      <title>Reports — Budget Book</title>
      <PageHeader title="Reports" subtitle="See how each month turned out.">
        {months.length > 0 && (
          <>
            <select
              aria-label="Report month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="border-line bg-surface h-10 rounded-lg border px-3 text-sm"
            >
              {months.map((value) => (
                <option key={value} value={value}>
                  {formatMonth(value)}
                </option>
              ))}
            </select>
            <Button variant="secondary" onClick={() => download('xlsx')}>
              <LuFileSpreadsheet className="size-4" aria-hidden="true" /> Excel
            </Button>
            <Button variant="secondary" onClick={() => download('pdf')}>
              <LuFileText className="size-4" aria-hidden="true" /> PDF
            </Button>
          </>
        )}
      </PageHeader>

      {error ? (
        <Card>
          <ErrorState message={error} />
        </Card>
      ) : loading && !showReport && months.length === 0 ? (
        <PageLoader />
      ) : months.length === 0 ? (
        <Card>
          <EmptyState icon={LuChartColumn} title="No reports yet" description="Create a budget and reports will appear here." />
        </Card>
      ) : showReport ? (
        <div className="space-y-4">
          <MonthInsights month={month} />
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-5">
              <h2 className="text-[15px] font-semibold">{formatMonth(report.month)}</h2>
              <p className="text-ink-3 mb-2 text-[13px]">
                {report.previous ? `Compared with ${formatMonth(report.previous.month)}` : 'No earlier month to compare'}
              </p>
              <Compare label="Income" current={report.income} previous={report.previous?.income} currency={currency} />
              <Compare label="Spent" current={report.spent} previous={report.previous?.spent} currency={currency} />
              <Compare label="Planned" current={report.planned} currency={currency} />
              <Compare label="Savings goal" current={report.savingsGoal} previous={report.previous?.savingsGoal} currency={currency} />
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader title="Spending by category" />
              <div className="p-5">
                {spentItems.length > 0 ? (
                  <CategoryBarChart categories={spentItems.slice(0, 10)} currency={currency} />
                ) : (
                  <p className="text-ink-2 py-10 text-center text-sm">No spending recorded this month.</p>
                )}
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Budgets this month"
              subtitle={`${report.budgets.length} ${report.budgets.length === 1 ? 'budget' : 'budgets'}`}
            />
            <div className="mt-3">
              <Table head={[{ label: 'Budget' }, { label: 'Planned', right: true }, { label: 'Spent', right: true }, { label: 'Remaining', right: true }]}>
                {report.budgets.map((budget) => (
                  <tr key={budget.id}>
                    <Td>
                      <Link to={`/app/budgets/${budget.id}`} className="text-accent-text font-medium">
                        {budget.name}
                      </Link>
                    </Td>
                    <Td right>{formatMoney(budget.planned, currency)}</Td>
                    <Td right>{formatMoney(budget.spent, currency)}</Td>
                    <Td right className={budget.planned - budget.spent < 0 ? 'text-critical' : ''}>
                      {formatMoney(budget.planned - budget.spent, currency)}
                    </Td>
                  </tr>
                ))}
              </Table>
            </div>
          </Card>

          <Card>
            <CardHeader title="All categories" subtitle="Every budget this month, added together" />
            <div className="mt-3">
            <Table
              head={[
                { label: 'Category' },
                { label: 'Planned', right: true },
                { label: 'Spent', right: true },
                { label: 'Remaining', right: true },
              ]}
            >
              {report.items.map((item) => (
                <tr key={item.categoryName}>
                  <Td className="font-medium">{item.categoryName}</Td>
                  <Td right>{formatMoney(item.amount, currency)}</Td>
                  <Td right>{formatMoney(item.spent, currency)}</Td>
                  <Td right className={item.remaining < 0 ? 'text-critical' : ''}>
                    {formatMoney(item.remaining, currency)}
                  </Td>
                </tr>
              ))}
            </Table>
            </div>
          </Card>
        </div>
      ) : (
        <PageLoader />
      )}
    </>
  );
}

export default Reports;
