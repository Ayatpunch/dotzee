import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Import page components
import HomePage from './pages/HomePage';
import GettingStartedPage from './pages/GettingStartedPage';
import CoreConceptsPage from './pages/CoreConceptsPage';
import ApiReferencePage from './pages/ApiReferencePage';
import AdvancedGuidesPage from './pages/AdvancedGuidesPage';
import ExamplesPage from './pages/ExamplesPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <Layout>
            <HomePage />
          </Layout>
        } />
        <Route path="/getting-started" element={
          <Layout>
            <GettingStartedPage />
          </Layout>
        } />
        <Route path="/core-concepts" element={
          <Layout>
            <CoreConceptsPage />
          </Layout>
        } />
        <Route path="/api-reference" element={
          <Layout>
            <ApiReferencePage />
          </Layout>
        } />
        <Route path="/advanced-guides" element={
          <Layout>
            <AdvancedGuidesPage />
          </Layout>
        } />
        <Route path="/examples" element={
          <Layout>
            <ExamplesPage />
          </Layout>
        } />
        <Route path="*" element={
          <Layout>
            <NotFoundPage />
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
