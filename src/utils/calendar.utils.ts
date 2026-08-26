// ──────────────────────────────────────────────────────────
//  Tipos compartilhados do Calendário
// ──────────────────────────────────────────────────────────

export type CalendarViewMode = 'day' | 'week' | 'month';

export interface CalendarAppointmentItem {
  name: string;
  price: string;
}

/** Representação normalizada de um agendamento para o calendário */
export interface CalendarAppointment {
  id: number | string;
  start: Date;
  end: Date;
  status: string;
  statusDisplay: string;
  clientName: string;
  professionalName: string;
  services: CalendarAppointmentItem[];
  totalPrice: string;
  discount: string;
  notes?: string;
  left?: number;
  width?: number;
}

/** Uma célula do grid mensal */
export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

// ──────────────────────────────────────────────────────────
//  Constantes
// ──────────────────────────────────────────────────────────

export const WEEK_DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
export const MONTH_NAMES_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

export const START_HOUR = 7;
export const END_HOUR = 21;

// ──────────────────────────────────────────────────────────
//  Funções utilitárias de data
// ──────────────────────────────────────────────────────────

/** Verifica se duas datas são o mesmo dia */
export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/** Formata data como YYYY-MM-DD */
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Formata hora como HH:mm */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/** Formata data e hora para o input datetime-local */
export function formatDateTimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Soma dias a uma data */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Soma meses a uma data */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

// ──────────────────────────────────────────────────────────
//  Geradores de grid
// ──────────────────────────────────────────────────────────

/** Retorna o grid de semanas para um mês (5-6 semanas × 7 dias) */
export function getMonthGrid(year: number, month: number): CalendarDay[][] {
  const today = new Date();
  const firstDay = new Date(year, month, 1);
  const startOfWeek = firstDay.getDay(); // 0 = Domingo

  const weeks: CalendarDay[][] = [];
  const current = new Date(year, month, 1 - startOfWeek);

  for (let w = 0; w < 6; w++) {
    const week: CalendarDay[] = [];
    for (let d = 0; d < 7; d++) {
      week.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month && current.getFullYear() === year,
        isToday: isSameDay(current, today),
      });
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
    // Para se já passou do mês e completou pelo menos 5 semanas
    if (current.getMonth() !== month && w >= 4) break;
  }

  return weeks;
}

/** Retorna os 7 dias da semana que contém a data */
export function getWeekDays(date: Date): Date[] {
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

/** Retorna os horários do dia (slots de 1h) */
export function getHourSlots(): number[] {
  return Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
}

// ──────────────────────────────────────────────────────────
//  Cálculos de range visível
// ──────────────────────────────────────────────────────────

/** Retorna o range de datas visível para API (date_from, date_to) */
export function getVisibleRange(
  date: Date,
  mode: CalendarViewMode,
): { dateFrom: string; dateTo: string } {
  if (mode === 'day') {
    const d = formatDateISO(date);
    return { dateFrom: d, dateTo: d };
  }

  if (mode === 'week') {
    const days = getWeekDays(date);
    return { dateFrom: formatDateISO(days[0]), dateTo: formatDateISO(days[6]) };
  }

  // month — incluir dias do mês anterior/próximo que aparecem no grid
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const startOffset = firstDay.getDay();
  const start = addDays(firstDay, -startOffset);

  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const endOffset = 6 - lastDay.getDay();
  const end = addDays(lastDay, endOffset);

  return { dateFrom: formatDateISO(start), dateTo: formatDateISO(end) };
}

// ──────────────────────────────────────────────────────────
//  Posicionamento de eventos (para views de timeline)
// ──────────────────────────────────────────────────────────

const HOUR_HEIGHT = 64; // px por hora na timeline

/** Calcula posição top e height de um evento na timeline */
export function getEventPosition(start: Date, end: Date): { top: number; height: number } {
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const duration = Math.max(endMinutes - startMinutes, 15); // mínimo 15min

  const top = ((startMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  const height = (duration / 60) * HOUR_HEIGHT;

  return { top: Math.max(top, 0), height: Math.max(height, 16) };
}

/** Calcula posição da linha "agora" na timeline */
export function getNowLinePosition(): number {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  return ((minutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
}

/** Filtra agendamentos de um dia específico */
export function getAppointmentsForDay(
  appointments: CalendarAppointment[],
  day: Date,
): CalendarAppointment[] {
  return appointments.filter((appt) => isSameDay(appt.start, day));
}

// ──────────────────────────────────────────────────────────
//  Cores por status
// ──────────────────────────────────────────────────────────

export interface StatusColors {
  bg: string;
  text: string;
  border: string;
}

export function getStatusColors(status: string): StatusColors {
  switch (status) {
    case 'pending':
      return { bg: '#FFF3E0', text: '#E65100', border: '#FFB74D' };
    case 'confirmed':
      return { bg: '#E3F2FD', text: '#1565C0', border: '#64B5F6' };
    case 'completed':
      return { bg: '#E8F5E9', text: '#2E7D32', border: '#81C784' };
    case 'cancelled':
      return { bg: '#F5F5F5', text: '#9E9E9E', border: '#E0E0E0' };
    default:
      return { bg: '#F5F5F5', text: '#616161', border: '#BDBDBD' };
  }
}

// ──────────────────────────────────────────────────────────
//  Título do header baseado no modo
// ──────────────────────────────────────────────────────────

export function getHeaderTitle(date: Date, mode: CalendarViewMode): string {
  if (mode === 'month') {
    return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
  }
  if (mode === 'day') {
    return `${date.getDate()} de ${MONTH_NAMES[date.getMonth()]} de ${date.getFullYear()}`;
  }
  // week
  const days = getWeekDays(date);
  const start = days[0];
  const end = days[6];
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} de ${MONTH_NAMES_SHORT[start.getMonth()]} ${start.getFullYear()}`;
  }
  return `${start.getDate()} ${MONTH_NAMES_SHORT[start.getMonth()]} – ${end.getDate()} ${MONTH_NAMES_SHORT[end.getMonth()]} ${end.getFullYear()}`;
}

// ──────────────────────────────────────────────────────────
//  Cálculo de sobreposição de eventos (Overlaps)
// ──────────────────────────────────────────────────────────

/** 
 * Calcula as propriedades left e width (em porcentagem 0 a 1) para 
 * exibir eventos que se sobrepõem lado a lado.
 */
export function calculateOverlaps(appointments: CalendarAppointment[]): CalendarAppointment[] {
  if (appointments.length === 0) return [];
  
  // 1. Ordena por start_time, depois por end_time (maior duração primeiro)
  const sorted = [...appointments].sort((a, b) => {
    if (a.start.getTime() !== b.start.getTime()) {
      return a.start.getTime() - b.start.getTime();
    }
    return b.end.getTime() - a.end.getTime();
  });

  // 2. Agrupar eventos conexos (overlapping groups)
  const groups: CalendarAppointment[][] = [];
  let currentGroup: CalendarAppointment[] = [];
  let currentGroupEnd = new Date(0);

  for (const appt of sorted) {
    if (appt.start >= currentGroupEnd) {
      if (currentGroup.length > 0) groups.push(currentGroup);
      currentGroup = [appt];
      currentGroupEnd = appt.end;
    } else {
      currentGroup.push(appt);
      if (appt.end > currentGroupEnd) {
        currentGroupEnd = appt.end;
      }
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup);

  // 3. Processar grupo a grupo para calcular width e left
  const result: CalendarAppointment[] = [];
  
  for (const group of groups) {
    const groupCols: CalendarAppointment[][] = [];
    
    for (const appt of group) {
      let placed = false;
      for (const col of groupCols) {
        const lastAppt = col[col.length - 1];
        if (lastAppt.end.getTime() <= appt.start.getTime()) {
          col.push(appt);
          placed = true;
          break;
        }
      }
      if (!placed) {
        groupCols.push([appt]);
      }
    }

    const numCols = groupCols.length;
    const widthPct = 100 / numCols;
    
    groupCols.forEach((col, colIdx) => {
      for (const appt of col) {
        result.push({
          ...appt,
          left: (colIdx * widthPct) / 100, // 0.0 a 1.0
          width: widthPct / 100 // 0.0 a 1.0
        });
      }
    });
  }

  return result;
}

