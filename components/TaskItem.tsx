
import React from 'react';
import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  return (
    <div className={`group relative bg-slate-800/60 p-3 rounded-lg border border-slate-700/50 shadow-sm hover:border-slate-600 transition-all ${task.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <input 
          type="checkbox" 
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          className="mt-1 rounded bg-slate-700 border-slate-600 text-primary focus:ring-primary focus:ring-offset-slate-900 h-4 w-4 transition-all"
        />
        <span className={`text-sm transition-all ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
          {task.text}
        </span>
      </div>
      <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1 bg-slate-800/90 backdrop-blur-sm pl-2 rounded">
        <button 
          onClick={() => onDelete(task.id)}
          className="p-1 text-slate-400 hover:text-red-400 transition-colors"
        >
          <span className="material-icons text-xs">delete</span>
        </button>
      </div>
    </div>
  );
};
