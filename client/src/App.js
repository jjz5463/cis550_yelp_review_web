import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SearchResultPage from './pages/SearchResultPage';
import BusinessInfoPage from './pages/BusinessInfoPage';
// Other imports if necessary

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/searchresult" element={<SearchResultPage />} />
                <Route path="/business/:businessId" element={<BusinessInfoPage />} />
            </Routes>
        </Router>
    );
}

export default App;

