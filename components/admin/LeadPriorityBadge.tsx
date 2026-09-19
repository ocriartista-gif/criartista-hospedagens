export function LeadPriorityBadge({
  level,
  score,
}: {
  level: string | null;
  score: number | null;
}) {
  const safeLevel = level ?? "baixa";
  const labels: Record<string, string> = {
    urgente: "Urgente",
    alta: "Alta",
    media: "Média",
    baixa: "Baixa",
    bloqueado: "Bloqueado",
  };

  return (
    <span className={`priority-badge priority-${safeLevel}`}>
      {labels[safeLevel] ?? safeLevel}
      {typeof score === "number" && <small>{score}</small>}
    </span>
  );
}
