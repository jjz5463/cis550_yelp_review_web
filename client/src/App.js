import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SearchResultPage from './pages/SearchResultPage';
import BusinessInfoPage from './pages/BusinessInfoPage';
import UserInfoPage from './pages/UserInfoPage';
import NavigationBar from './components/NavigationBar';
import TopUserPage from './pages/TopUserPage'
import TopBusinessPage from './pages/TopBusinessPage';
import NearbyBusinessPage from './pages/NearbyBusinessPage';
// Other imports if necessary

function App() {
    return (
        <Router>
            <NavigationBar />
            <div className="page-content">
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/searchresult" element={<SearchResultPage />} />
                <Route path="/business/:businessId" element={<BusinessInfoPage />} />
                <Route path="/user/:userId/info" element={<UserInfoPage />} />
                <Route path="/top_business" element={<TopBusinessPage />} />
                <Route path="/top_user" element={<TopUserPage />} />
                <Route path="/nearby" element={<NearbyBusinessPage />} />
            </Routes>
            </div>
        </Router>
    );
}

export default App;

