import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import UploadPage from './pages/upload/UploadPage';
import RetrievePage from './pages/retrieve/RetrievePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/retrieve" element={<RetrievePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
