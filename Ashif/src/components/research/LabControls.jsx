// Controls shared by the research labs (the Kelly lab and the paycheck lab).

/**
 * A labeled range slider with its value beside the label. `marks` are small
 * labeled triangles under the track (positions in the slider's own units):
 * the triangle takes the mark's color, the words stay in the text color.
 */
export function Slider({ id, label, value, min, max, step = 1, onChange, display, valueText, marks = [] }) {
  const at = (v) => `calc(11px + (100% - 22px) * ${(v - min) / (max - min)})`;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm text-muted">
          {label}
        </label>
        <output htmlFor={id} className="font-mono text-lg font-bold text-fg tabular-nums">
          {display}
        </output>
      </div>
      <div className="relative mt-1.5">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-valuetext={valueText}
          className="lab-range block w-full"
          style={{ '--val': `${((value - min) / (max - min)) * 100}%` }}
        />
        {marks.map((mark) => (
          <span
            key={mark.key}
            aria-hidden="true"
            className="pointer-events-none absolute top-full -mt-1 flex -translate-x-[5px] items-center gap-1 whitespace-nowrap font-mono text-[11px] leading-4 text-fg"
            style={{ left: at(mark.value) }}
          >
            <svg viewBox="0 0 10 9" className="size-2.5" style={{ fill: mark.color }}>
              <path d="M5 0l5 9H0z" />
            </svg>
            {mark.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** A big number with its label underneath (the label comes first for screen readers). */
export function Readout({ label, value, note, tone = 'text-fg' }) {
  return (
    <div className="flex flex-col-reverse justify-end gap-1">
      <dt className="text-[13px] leading-5 text-muted">
        {label}
        {note ? <span className="block text-subtle">{note}</span> : null}
      </dt>
      <dd className={`type-heading text-[1.75rem] leading-none tabular-nums ${tone}`}>{value}</dd>
    </div>
  );
}
