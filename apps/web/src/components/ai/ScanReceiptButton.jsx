import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { LuScanLine } from 'react-icons/lu';
import { scanReceipt } from '../../api/aiApi';
import { getErrorMessage } from '../../api/client';
import { useAi } from '../../hooks/useAi';
import { shrinkImage } from '../../lib/image';
import { Button } from '../ui/Button';
import { AiSetupPrompt } from './AiSetupPrompt';

/**
 * Reads a receipt photo with the connected AI and hands the result to the
 * expense form. Nothing is saved until the person reviews it and clicks Save.
 */
export function ScanReceiptButton({ onScanned }) {
  const { ready, isDemo } = useAi();
  const fileInput = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  const start = () => {
    if (ready) fileInput.current.click();
    else setNeedsSetup(true);
  };

  const read = async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    try {
      setScanning(true);
      const result = await scanReceipt(await shrinkImage(file));
      if (!result.readable) {
        toast.error("That photo couldn't be read as a receipt. Try a sharper, well-lit photo, or add the expense by hand.");
        return;
      }
      onScanned(result);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setScanning(false);
    }
  };

  return (
    <>
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        aria-label="Receipt photo"
        onChange={read}
      />
      <Button variant="secondary" loading={scanning} onClick={start}>
        {!scanning && <LuScanLine className="size-4" aria-hidden="true" />}
        {scanning ? 'Reading receipt…' : 'Scan receipt'}
      </Button>
      <AiSetupPrompt open={needsSetup} feature="Receipt scanning" isDemo={isDemo} onClose={() => setNeedsSetup(false)} />
    </>
  );
}
