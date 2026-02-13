
import { DayType, Task, DailyNote } from './types';

export const DAYS: DayType[] = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export const INITIAL_TASKS: Task[] = [
  { id: '1', text: 'Review project goals', completed: true, day: 'Segunda' },
  { id: '2', text: 'Team sync meeting', completed: false, day: 'Segunda' },
  { id: '3', text: 'Client report drafting', completed: false, day: 'Terça' },
  { id: '4', text: 'Weekly content plan', completed: true, day: 'Quinta' },
  { id: '5', text: 'Backend performance audit', completed: false, day: 'Sexta' },
  { id: '6', text: 'Grocery shopping', completed: false, day: 'Sábado' },
];

export const INITIAL_DAILY_NOTES: DailyNote[] = DAYS.map(day => ({ day, text: '' }));
