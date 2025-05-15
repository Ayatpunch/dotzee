import CounterOptions from './components/CounterOptions';
import CounterSetup from './components/CounterSetup';
import './App.css'; // Default Vite styles

function App() {
  return (
    <div className="App">
      <div className="hero-section">
        <h1>Dotzee State Management</h1>
        <p className="subtitle">A modern, Pinia-inspired reactive state library for React with fine-grained updates and TypeScript support</p>
      </div>

      <div className="counters-container">
        <CounterOptions />
        <CounterSetup />
      </div>

      <footer className="footer">
        <p>Built with React and Dotzee · Inspired by Pinia · <a href="https://github.com/Ayatpunch/dotzee" target="_blank" rel="noopener noreferrer">GitHub</a></p>
      </footer>
    </div>
  );
}

export default App;
