import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { LuRepeat } from 'react-icons/lu';
import { completeReminder } from '../../api/workspaceApi';
import { fetchBudgets } from '../../api/financeApi';
import { getErrorMessage } from '../../api/client';
import { setBudgets } from '../../redux/features/budgetSlice';
import { refreshAlerts } from '../../redux/features/notificationSlice';
import { logger } from '../../lib/logger';
import { formatDate, today } from '../../lib/format';
import { nextDueDate } from '../../lib/reminders';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Field';
import { CategorySelect } from '../ui/CategorySelect';
import { InfoNote } from '../ui/Feedback';
import { Modal } from '../ui/Modal';
import { Segmented } from '../ui/Segmented';

/** What marking it done will do, in words, so the budget numbers never surprise anyone. */
function completeEffect(state, budgetName) {
  if (!state.record) return 'It moves to Done. Nothing is added to Transactions or a budget.';
  if (!state.budgetId) return 'Saved as a sent transaction, not linked to a budget.';
  if (!state.categoryName) return 'Choose a category so the payment counts against the right limit.';
  return `Saved as a sent transaction and counted in "${budgetName}" › ${state.categoryName}.`;
}

function successMessage(result) {
  const paid = result.transaction?.budgetName
    ? `Paid and counted in "${result.transaction.budgetName}".`
    : result.transaction
      ? 'Payment saved.'
      : 'Marked as done.';
  return result.next ? `${paid} Next one due ${formatDate(result.next.dueDate)}.` : paid;
}

/** With one budget in the month there is nothing to choose, so it is picked for you. */
const defaultBudget = (budgets, reminder, date) => {
  const inMonth = budgets.filter((budget) => budget.month === date.slice(0, 7));
  return inMonth.length === 1 && reminder.categoryName ? String(inMonth[0].id) : '';
};

function CompleteForm({ reminder, onClose }) {
  const dispatch = useDispatch();
  const budgets = useSelector((state) => state.budget.items);
  const [saving, setSaving] = useState(false);
  const [budgetTouched, setBudgetTouched] = useState(false);
  const [state, setState] = useState(() => ({
    record: Boolean(reminder.amount),
    completedOn: today(),
    amount: reminder.amount ? String(reminder.amount) : '',
    paidTo: reminder.title,
    method: '',
    budgetId: defaultBudget(budgets, reminder, today()),
    categoryName: reminder.categoryName ?? '',
  }));

  // Opened from the bell or the dashboard, budgets may not be loaded yet.
  useEffect(() => {
    const loadBudgets = async () => {
      try {
        dispatch(setBudgets(await fetchBudgets()));
      } catch (err) {
        logger.warn('Could not load budgets', getErrorMessage(err));
      }
    };
    loadBudgets();
  }, [dispatch]);

  const suggested = budgetTouched || state.budgetId ? state.budgetId : defaultBudget(budgets, reminder, state.completedOn);
  const current = { ...state, budgetId: suggested };
  const budgetsInMonth = budgets.filter((budget) => budget.month === current.completedOn.slice(0, 7));
  const selected = budgetsInMonth.find((budget) => String(budget.id) === current.budgetId);

  const update = (event) => {
    if (event.target.name === 'budgetId') setBudgetTouched(true);
    setState({ ...current, [event.target.name]: event.target.value });
  };
  const changeDate = (completedOn) => {
    const stillValid = budgets.some((budget) => String(budget.id) === current.budgetId && budget.month === completedOn.slice(0, 7));
    setState({ ...current, completedOn, budgetId: stillValid ? current.budgetId : '' });
  };

  const submit = async (event) => {
    event.preventDefault();
    const body = { completedOn: current.completedOn };
    if (current.record) {
      body.payment = {
        amount: Number(current.amount),
        paidTo: current.paidTo.trim(),
        method: current.method.trim(),
        budgetId: current.budgetId ? Number(current.budgetId) : null,
        categoryName: current.budgetId ? current.categoryName.trim() || null : null,
      };
    }
    try {
      setSaving(true);
      const result = await completeReminder(reminder.id, body);
      toast.success(successMessage(result));
      // The bell, the dashboard and the Reminders page all reload from this.
      dispatch(refreshAlerts());
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <Segmented
        legend="How was it settled?"
        name="record"
        options={[
          { value: 'yes', label: 'I paid it' },
          { value: 'no', label: 'Just mark done' },
        ]}
        value={current.record ? 'yes' : 'no'}
        onChange={(value) => setState({ ...current, record: value === 'yes' })}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={current.record ? 'Paid on' : 'Done on'}
          name="completedOn"
          type="date"
          required
          value={current.completedOn}
          onChange={(event) => event.target.value && changeDate(event.target.value)}
        />
        {current.record && (
          <>
            <Input label="Amount paid" name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00" value={current.amount} onChange={update} />
            <Input label="Paid to" name="paidTo" required maxLength={100} value={current.paidTo} onChange={update} />
            <Input label="Payment method" name="method" required maxLength={60} placeholder="Bank, card, cash" value={current.method} onChange={update} />
            <Select
              label="Budget (optional)"
              name="budgetId"
              value={current.budgetId}
              onChange={update}
              hint={budgetsInMonth.length === 0 ? 'There is no budget for this month.' : undefined}
            >
              <option value="">Not linked</option>
              {budgetsInMonth.map((budget) => (
                <option key={budget.id} value={budget.id}>
                  {budget.name}
                </option>
              ))}
            </Select>
          </>
        )}
      </div>

      {current.record && current.budgetId && (
        <CategorySelect value={current.categoryName} onChange={(categoryName) => setState({ ...current, categoryName })} />
      )}

      <InfoNote>{completeEffect(current, selected?.name)}</InfoNote>
      {reminder.frequency !== 'none' && (
        <p className="text-ink-2 flex items-center gap-2 text-[13px]">
          <LuRepeat className="text-ink-3 size-4" aria-hidden="true" />
          The next reminder will be due {formatDate(nextDueDate(reminder.dueDate, reminder.frequency, reminder.anchorDay))}.
        </p>
      )}

      <div className="border-line flex justify-end gap-2 border-t pt-4">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {current.record ? 'Save payment' : 'Mark done'}
        </Button>
      </div>
    </form>
  );
}

/**
 * Marks a reminder done, optionally recording the payment. Used from the
 * Reminders page, the bell and the dashboard, so all three behave the same.
 */
function MarkPaidDialog({ reminder, onClose }) {
  return (
    <Modal
      open={Boolean(reminder)}
      size="lg"
      title={reminder ? `Mark "${reminder.title}" as done` : ''}
      description="Record the payment to keep Transactions and your budget up to date."
      onClose={onClose}
    >
      {reminder && <CompleteForm key={reminder.id} reminder={reminder} onClose={onClose} />}
    </Modal>
  );
}

export default MarkPaidDialog;
