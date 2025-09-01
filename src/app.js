import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DocumentsPage from './documents/page';
import NewPage from './newPage'; // Import your new page component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DocumentsPage />} /> {/* Default route */}
        <Route path="/new-page" element={<NewPage />} /> {/* New page route */}
      </Routes>
    </Router>
  );
}

export default App;