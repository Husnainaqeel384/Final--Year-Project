import { Link } from 'react-router-dom';
import { LuSparkles } from 'react-icons/lu';
import { buttonClass } from '../ui/Button';
import { Modal } from '../ui/Modal';

/** Shown instead of an AI action until a provider key is connected. */
export function AiSetupPrompt({ open, feature, isDemo, onClose }) {
  return (
    <Modal open={open} title="Connect an AI provider first" onClose={onClose}>
      <div className="flex gap-3">
        <span className="bg-accent-soft text-accent-text flex size-10 shrink-0 items-center justify-center rounded-full">
          <LuSparkles className="size-5" aria-hidden="true" />
        </span>
        <p className="text-ink-2 text-sm">
          {feature} uses your own Claude, ChatGPT, Gemini or DeepSeek account.{' '}
          {isDemo
            ? 'On this demo your key stays in this browser tab and is never saved.'
            : 'Add your API key once in Settings; it is stored encrypted.'}
        </p>
      </div>
      <div className="border-line mt-5 flex justify-end gap-2 border-t pt-4">
        <button type="button" onClick={onClose} className={buttonClass('secondary')}>
          Not now
        </button>
        <Link to="/app/settings" className={buttonClass('primary')}>
          Go to Settings
        </Link>
      </div>
    </Modal>
  );
}
