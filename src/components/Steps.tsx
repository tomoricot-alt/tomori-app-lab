export default function Steps({ steps }: { steps: string[] }) {
  return (
    <ol className="steps">
      {steps.map((s, i) => (
        <li key={i}>
          <span className="step-no" aria-hidden="true">{i + 1}</span>
          <span className="step-text"><span className="sr-only">ステップ{i + 1}：</span>{s}</span>
        </li>
      ))}
    </ol>
  );
}
