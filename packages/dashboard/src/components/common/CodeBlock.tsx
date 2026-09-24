/** Raw text with line numbers and a copy button, for source views. */
import { CopyButton } from './CopyButton';

export function CodeBlock({ code, label, className }: { code: string; label?: string; className?: string }) {
  const lines = code.replace(/\n$/, '').split('\n');
  return (
    <div className={`overflow-hidden rounded-xl border border-line bg-surface ${className ?? ''}`}>
      <div className="flex h-10 items-center justify-between border-b border-line bg-surface-2 px-3">
        <span className="font-mono text-[12px] text-ink-3">{label}</span>
        <CopyButton value={code} label="Copy source" toastMessage="Copied to clipboard" />
      </div>
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full border-collapse font-mono text-[12.5px] leading-[1.7]">
          <tbody>
            {lines.map((line, index) => (
              <tr key={index} className="hover:bg-surface-2/60">
                <td className="tabular w-12 select-none pr-3 pl-3 text-right align-top text-ink-3/70">
                  {index + 1}
                </td>
                <td className="pr-4 break-words whitespace-pre-wrap text-ink">{line || ' '}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
