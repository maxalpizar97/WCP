import { useState } from 'react';
import Layout from './components/Layout';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Matches from './pages/Matches';
import Predict from './pages/Predict';
import History from './pages/History';

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [preselectedMatch, setPreselectedMatch] = useState(null);

  function handlePredict(match) {
    setPreselectedMatch(match);
    setPage('predict');
  }

  function renderPage() {
    switch (page) {
      case 'matches':
        return <Matches onPredict={handlePredict} />;
      case 'predict':
        return (
          <Predict
            preselectedMatch={preselectedMatch}
            onClearPreselect={() => setPreselectedMatch(null)}
          />
        );
      case 'history':
        return <History />;
      default:
        return <Dashboard onNavigate={setPage} onPredict={handlePredict} />;
    }
  }

  return (
    <>
      <Layout active={page} onNavigate={setPage}>
        {renderPage()}
      </Layout>
      <BottomNav active={page} onChange={setPage} />
    </>
  );
}
