import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import DeckPage from './pages/DeckPage';
import StudyPage from './pages/StudyPage';
import QuizPage from './pages/QuizPage';
import StatsPage from './pages/StatsPage';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-2xl font-bold hover:text-blue-200 transition-colors duration-200 flex items-center">
                  <span className="mr-2">📚</span>
                  Spanish Flashcards
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Link to="/" className="hover:bg-blue-700 hover:shadow-md px-4 py-2 rounded-lg transition-all duration-200 font-medium">
                  🏠 Home
                </Link>
                <Link to="/stats" className="hover:bg-blue-700 hover:shadow-md px-4 py-2 rounded-lg transition-all duration-200 font-medium">
                  📊 Statistics
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/deck/:deckId" element={<DeckPage />} />
              <Route path="/deck/:deckId/study" element={<StudyPage />} />
              <Route path="/deck/:deckId/quiz" element={<QuizPage />} />
              <Route path="/stats" element={<StatsPage />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </Router>
  );
}

export default App;
