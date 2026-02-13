
export type DayType = 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sábado' | 'Domingo';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  day: DayType;
}

export interface DailyNote {
  day: DayType;
  text: string;
}

export interface WeeklyConfig {
  focus: string;
  generalNotes: string;
}

export interface AppState {
  tasks: Task[];
  dailyNotes: DailyNote[];
  weeklyConfig: WeeklyConfig;
}
