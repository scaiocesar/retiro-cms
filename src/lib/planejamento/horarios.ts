/** Parse "HH:mm" or "H:mm" into minutes since midnight. */
export function parseHorarioToMinutes(horario: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(horario.trim());
  if (!match) {
    throw new Error("Horário inválido. Use o formato HH:mm");
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error("Horário inválido. Use o formato HH:mm");
  }
  return hours * 60 + minutes;
}

/** Format minutes since midnight as "HH:mm". */
export function formatMinutesToHorario(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Format minutes since midnight as "h:mm AM/PM". */
export function formatMinutesToDisplay(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
}

/** Format duration minutes as "H:MM" (e.g. 80 → "1:20"). */
export function formatDuracao(minutos: number): string {
  const hours = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${hours}:${String(mins).padStart(2, "0")}`;
}

/**
 * Mask for typing duration without typing ":".
 * Digits only; last 2 are minutes, the rest are hours.
 * "2" → "0:02", "20" → "0:20", "120" → "1:20", "1230" → "12:30"
 */
export function formatDuracaoMask(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (!digits) return "";
  if (digits.length <= 2) {
    return `0:${digits.padStart(2, "0")}`;
  }
  const hours = Number(digits.slice(0, -2));
  const mins = digits.slice(-2);
  return `${hours}:${mins}`;
}

export const DURACAO_MASK_PLACEHOLDER = "0:20";

/**
 * Parse duration like "1:30", "0:20", or plain minutes "90".
 * Returns duration in minutes.
 */
export function parseDuracao(value: string): number {
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) {
    const mins = Number(trimmed);
    if (mins < 1) throw new Error("Duração deve ser pelo menos 1 minuto");
    return mins;
  }
  const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (!match) {
    throw new Error("Duração inválida. Use H:MM ou minutos");
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (minutes > 59) throw new Error("Duração inválida. Use H:MM ou minutos");
  const total = hours * 60 + minutes;
  if (total < 1) throw new Error("Duração deve ser pelo menos 1 minuto");
  return total;
}

export type AtividadeComHorario<T extends { duracaoMinutos: number }> = T & {
  horarioInicio: string;
  horarioFim: string;
};

export function calcularHorarios<T extends { duracaoMinutos: number }>(
  horarioInicio: string,
  atividades: T[]
): { atividades: AtividadeComHorario<T>[]; horarioTermino?: string } {
  let cursor = parseHorarioToMinutes(horarioInicio);
  const result: AtividadeComHorario<T>[] = atividades.map((atividade) => {
    const inicio = cursor;
    const fim = cursor + atividade.duracaoMinutos;
    cursor = fim;
    return {
      ...atividade,
      horarioInicio: formatMinutesToHorario(inicio),
      horarioFim: formatMinutesToHorario(fim),
    };
  });
  return {
    atividades: result,
    horarioTermino:
      result.length > 0
        ? result[result.length - 1].horarioFim
        : undefined,
  };
}
