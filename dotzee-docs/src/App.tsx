import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Import page components
import HomePage from './pages/HomePage';
import GettingStartedPage from './pages/GettingStartedPage';
import InstallationPage from './pages/InstallationPage';
import QuickStartPage from './pages/QuickStartPage';
import CoreConceptsPage from './pages/CoreConceptsPage';
import ReactivityPage from './pages/core-concepts/ReactivityPage';
import StoresPage from './pages/core-concepts/StoresPage';
import StatePage from './pages/core-concepts/StatePage';
import GettersPage from './pages/core-concepts/GettersPage';
import ActionsPage from './pages/core-concepts/ActionsPage';
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
        <Route path="/installation" element={
          <Layout>
            <InstallationPage />
          </Layout>
        } />
        <Route path="/quick-start" element={
          <Layout>
            <QuickStartPage />
          </Layout>
        } />
        <Route path="/core-concepts" element={
          <Layout>
            <CoreConceptsPage />
          </Layout>
        } />
        <Route path="/core-concepts/reactivity" element={
          <Layout>
            <ReactivityPage />
          </Layout>
        } />
        <Route path="/core-concepts/stores" element={
          <Layout>
            <StoresPage />
          </Layout>
        } />
        <Route path="/core-concepts/state" element={
          <Layout>
            <StatePage />
          </Layout>
        } />
        <Route path="/core-concepts/getters" element={
          <Layout>
            <GettersPage />
          </Layout>
        } />
        <Route path="/core-concepts/actions" element={
          <Layout>
            <ActionsPage />
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
