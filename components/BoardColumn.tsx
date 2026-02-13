
import React, { useState } from 'react';
import { DayType, Task, DailyNote } from '../types';
import { TaskItem } from './TaskItem';

interface BoardColumnProps {
  day: DayType;
  tasks: Task[];
  note: string;
  onAddTask: (day: DayType, text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateNote: (day: DayType, text: string) => void;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({ 
  day, 
  tasks, 
  note, 
  onAddTask, 
  onToggleTask, 
  onDeleteTask,
  onUpdateNote 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      onAddTask(day, newTaskText.trim());
      setNewTaskText('');
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col w-1/7 min-w-[240px] flex-1 bg-slate-900/40 rounded-xl border border-slate-800 p-3 transition-colors hover:bg-slate-900/60 group/column">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h2 className="font-bold text-sm uppercase tracking-wider text-slate-400">{day}</h2>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${progressPercent === 100 ? 'bg-green-500' : 'bg-primary'}`} 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className={`text-[10px] font-semibold ${progressPercent === 100 ? 'text-green-400' : 'text-slate-500'}`}>
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-accent transition-all hover:scale-105"
        >
          <span className="material-icons text-lg">add</span>
        </button>
      </div>

      {/* Task List */}
      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1 mb-4 min-h-[200px]">
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-2">
            <input
              autoFocus
              className="w-full p-2 bg-slate-800 border border-primary/50 rounded-lg text-sm text-slate-100 focus:ring-1 focus:ring-primary outline-none"
              placeholder="Nova tarefa..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onBlur={() => !newTaskText && setIsAdding(false)}
            />
          </form>
        )}
        
        {tasks.length > 0 ? (
          tasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onToggle={onToggleTask} 
              onDelete={onDeleteTask} 
            />
          ))
        ) : (
          !isAdding && (
            <div className="flex items-center justify-center h-24 border-2 border-dashed border-slate-800 rounded-xl">
              <p className="text-[10px] text-slate-600 font-medium">Sem tarefas</p>
            </div>
          )
        )}
      </div>

      {/* Daily Notes */}
      <div className="mt-auto">
        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-1">
          <span className="material-icons text-[12px]">sticky_note_2</span>
          Notas do Dia
        </label>
        <textarea 
          value={note}
          onChange={(e) => onUpdateNote(day, e.target.value)}
          className="w-full mt-1 p-2 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-300 focus:ring-1 focus:ring-primary focus:border-primary resize-none h-20 placeholder:text-slate-600 transition-all custom-scrollbar" 
          placeholder="Anotações rápidas..."
        ></textarea>
      </div>
    </div>
  );
};
