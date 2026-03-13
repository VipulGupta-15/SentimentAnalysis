import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { MediaInsight } from './pages/MediaInsight';
import { YoutubeAnalysis } from './pages/YoutubeAnalysis';

const App: React.FC = () => {
  return (
    <Router>
      <div className="bg-gray-900 min-h-screen text-gray-200 flex flex-col font-sans">
        <Navbar />
        <Routes>
          <Route path="/" element={<MediaInsight />} />
          <Route path="/youtube" element={<YoutubeAnalysis />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;