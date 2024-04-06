import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SearchResultPage from './pages/SearchResultPage';
// Other imports if necessary

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/searchresult" element={<SearchResultPage />} />
                {/* Define other routes as needed */}
            </Routes>
        </Router>
    );
}

export default App;

