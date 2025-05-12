import CounterOptions from './components/CounterOptions';
import CounterSetup from './components/CounterSetup';
import './App.css'; // Default Vite styles

function App() {
  return (
    <div className="App">
      <div className="hero-section">
        <h1>Zest State Management</h1>
        <p className="subtitle">A modern, Pinia-inspired reactive state library for React with fine-grained updates and TypeScript support</p>
      </div>

      <div className="counters-container">
        <CounterOptions />
        <CounterSetup />
      </div>

      <footer className="footer">
        <p>Built with React and Zest · Inspired by Pinia · <a href="https://github.com/your-repo/zest" target="_blank" rel="noopener noreferrer">GitHub</a></p>
      </footer>
    </div>
  );
}

export default App;
