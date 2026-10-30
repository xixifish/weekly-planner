type ProgressBarProps = {
  done: number;
  total: number;
};

export function ProgressBar({ done, total }: ProgressBarProps) {
  const percent = total === 0 ? 0 : (done / total) * 100;

  return (
    <div className="w-full md:w-62.5">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-text-grey-blue">WEEKLY PROGRESS</span>
        <span className="text-text-dark">
          {done}
          <span className="font-medium text-text-grey-blue">/{total}</span>
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Weekly progress"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        className="mt-2 h-1.5 rounded bg-progress-track"
      >
        <div
          className="h-full rounded bg-logo-orange"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
