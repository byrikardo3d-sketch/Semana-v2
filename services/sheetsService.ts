
/**
 * Note: To use Google Sheets as a database in a real production app:
 * 1. You can publish a sheet as CSV and 'fetch' it for READ operations.
 * 2. For WRITE operations, you typically need a Google App Script web app (serving as an API proxy).
 * 
 * For this demo, we simulate the 'Save' to Google Sheets by logging and persisting to LocalStorage, 
 * but providing the hooks for the actual sheet connection.
 */

import { AppState } from '../types';

const STORAGE_KEY = 'weekly_planner_data';

export const sheetsService = {
  /**
   * Loads data. In a real scenario, this would fetch from a Public Sheets CSV URL:
   * https://docs.google.com/spreadsheets/d/[ID]/gviz/tq?tqx=out:csv
   */
  async loadData(): Promise<AppState | null> {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  },

  /**
   * Saves data. In a real scenario, this would POST to a Google App Script Web App URL.
   */
  async saveData(data: AppState): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('Data synced to simulated database:', data);
    
    // Example of how to send to a Sheets Proxy:
    /*
    const GOOGLE_APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_DEPLOYMENT_URL';
    try {
      await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // standard for simple web apps
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (e) { console.error('Sheet Sync Failed', e); }
    */
  },

  /**
   * Exports data as CSV formatted for Google Sheets import
   */
  exportToCSV(data: AppState) {
    let csv = 'Dia,Tarefa,Status,Nota Diaria\n';
    data.tasks.forEach(task => {
      const note = data.dailyNotes.find(n => n.day === task.day)?.text || '';
      csv += `"${task.day}","${task.text.replace(/"/g, '""')}","${task.completed ? 'Feito' : 'Pendente'}","${note.replace(/"/g, '""')}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `weekly_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
