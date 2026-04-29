import * as React from 'react';
import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import ReservationForm from './components/ReservationForm';
import AdminDashboard from './components/AdminDashboard';
import AgentChat from './components/AgentChat';
import Header from './components/Header';

type View = 'book' | 'admin';

const App: React.FC = function () {
  const [view, setView] = useState<View>('book');

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <Header view={view} setView={setView} />
        <main className="pt-20">
          {view === 'book' ? <ReservationForm /> : <AdminDashboard />}
        </main>
        <AgentChat />
      </div>
    </ThemeProvider>
  );
};

export default App;
