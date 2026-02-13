
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { DAYS, INITIAL_TASKS, INITIAL_DAILY_NOTES } from './constants';
import { DayType, Task, WeeklyConfig } from './types';
import { BoardColumn } from './components/BoardColumn';
import { sheetsService } from './services/sheetsService';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyNotes, setDailyNotes] = useState(INITIAL_DAILY_NOTES);
  const [weeklyConfig, setWeeklyConfig] = useState<WeeklyConfig>({
    focus: '',
    generalNotes: ''
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const boardRef = useRef<HTMLDivElement>(null);

  // Load Initial Data
  useEffect(() => {
    const init = async () => {
      const data = await sheetsService.loadData();
      if (data) {
        setTasks(data.tasks);
        setDailyNotes(data.dailyNotes);
        setWeeklyConfig(data.weeklyConfig);
      } else {
        setTasks(INITIAL_TASKS);
        setWeeklyConfig({
          focus: 'Finalizar a interface do painel administrativo e validar com o cliente na Sexta-feira.',
          generalNotes: ''
        });
      }
    };
    init();
  }, []);

  // Save on change (Debounced sync)
  useEffect(() => {
    if (tasks.length === 0 && !weeklyConfig.focus) return; // Skip initial empty save

    const syncData = async () => {
      setIsSyncing(true);
      await sheetsService.saveData({ tasks, dailyNotes, weeklyConfig });
      setTimeout(() => setIsSyncing(false), 800);
    };

    const timeout = setTimeout(syncData, 2000);
    return () => clearTimeout(timeout);
  }, [tasks, dailyNotes, weeklyConfig]);

  const addTask = (day: DayType, text: string) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      completed: false,
      day
    };
    setTasks(prev => [...prev, newTask]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateDailyNote = (day: DayType, text: string) => {
    setDailyNotes(prev => prev.map(n => n.day === day ? { ...n, text } : n));
  };

  const resetWeek = () => {
    if (confirm('Atenção: Isso apagará todas as tarefas e notas desta semana. Deseja continuar?')) {
      setTasks([]);
      setDailyNotes(DAYS.map(day => ({ day, text: '' })));
      setWeeklyConfig({ focus: '', generalNotes: '' });
      localStorage.removeItem('weekly_planner_data');
    }
  };

  const handleExportPDF = async () => {
    if (!boardRef.current) return;
    
    setIsExporting(true);
    try {
      const element = boardRef.current;
      // Capturamos o elemento. Usamos scale para melhor resolução.
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a',
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`weekly_planner_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Houve um erro ao gerar o PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.completed).length;
  const globalProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-dark-bg font-display text-slate-100 min-h-screen flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg shadow-lg shadow-primary/20">
            <span className="material-icons text-white text-xl">event_repeat</span>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">Weekly Planner</h1>
            <p className="text-xs text-slate-400">Board de Gestão Recorrente</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={resetWeek}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-900/30 hover:border-red-500/50 border border-slate-700 rounded-lg text-sm font-medium transition-all text-slate-200 group"
          >
            <span className="material-icons text-sm text-primary group-hover:text-red-400">refresh</span>
            Reset Week
          </button>
          <div className="h-8 w-px bg-slate-800"></div>
          <button className="p-2 text-slate-400 hover:text-primary transition-colors">
            <span className="material-icons">settings</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30">
            <img 
              alt="User Profile" 
              className="w-full h-full object-cover" 
              src="https://picsum.photos/100/100" 
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Board */}
        <div className="flex-1 overflow-x-auto p-6 custom-scrollbar bg-slate-950/20" id="board-container">
          <div ref={boardRef} className="flex gap-4 h-full min-w-[1600px]">
            {DAYS.map(day => (
              <BoardColumn
                key={day}
                day={day}
                tasks={tasks.filter(t => t.day === day)}
                note={dailyNotes.find(n => n.day === day)?.text || ''}
                onAddTask={addTask}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onUpdateNote={updateDailyNote}
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col p-6 shadow-2xl overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-icons text-primary">analytics</span>
            <h3 className="font-bold text-white">Observações Semanais</h3>
          </div>
          
          <div className="flex-1 space-y-6">
            {/* Focus of the Week */}
            <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-primary uppercase">Foco da Semana</h4>
                <span className="material-icons text-xs text-primary/60">bolt</span>
              </div>
              <textarea 
                value={weeklyConfig.focus}
                onChange={(e) => setWeeklyConfig(prev => ({ ...prev, focus: e.target.value }))}
                className="w-full bg-transparent text-sm text-slate-300 leading-relaxed italic border-none focus:ring-0 p-0 resize-none h-20 placeholder:text-slate-600"
                placeholder="Qual o objetivo principal?"
              />
            </div>

            {/* General Notes */}
            <div className="flex-1 flex flex-col">
              <label className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center justify-between">
                Notas Gerais
                <span className="material-icons text-sm">edit_note</span>
              </label>
              <textarea 
                value={weeklyConfig.generalNotes}
                onChange={(e) => setWeeklyConfig(prev => ({ ...prev, generalNotes: e.target.value }))}
                className="flex-1 w-full p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-slate-200 focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none resize-none placeholder:text-slate-600 custom-scrollbar h-48" 
                placeholder="Escreva metas maiores, lembretes importantes ou reflexões sobre o progresso da semana aqui..."
              />
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase">Estatísticas Rápidas</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg group transition-all hover:bg-slate-750">
                  <div className="text-lg font-bold text-primary">{doneTasks}/{totalTasks}</div>
                  <div className="text-[10px] text-slate-500 uppercase">Tarefas Feitas</div>
                </div>
                <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg group transition-all hover:bg-slate-750">
                  <div className={`text-lg font-bold ${globalProgress === 100 ? 'text-green-400' : 'text-primary'}`}>
                    {globalProgress}%
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase">Concluído</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 space-y-3">
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className={`w-full py-2.5 ${isExporting ? 'bg-slate-700 cursor-not-allowed' : 'bg-primary hover:bg-accent'} text-white text-sm font-semibold rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2`}
            >
              <span className="material-icons text-sm">{isExporting ? 'sync' : 'picture_as_pdf'}</span>
              {isExporting ? 'Gerando PDF...' : 'Exportar para PDF'}
            </button>
            <button 
              onClick={() => sheetsService.exportToCSV({ tasks, dailyNotes, weeklyConfig })}
              className="w-full py-2 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-icons text-xs">table_chart</span>
              Exportar CSV para Sheets
            </button>
            <p className="text-[10px] text-slate-600 text-center italic">
              Use o PDF para relatórios e o CSV para Google Sheets.
            </p>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`}></span>
            {isSyncing ? 'Sincronizando...' : 'Sistema Online'}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-icons text-xs">cloud_done</span> 
            Todas as alterações salvas
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-primary cursor-pointer transition-colors">Guia de Atalhos</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Suporte</span>
          <span className="text-slate-700 select-none">v2.6.0</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
