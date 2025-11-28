import { Route, Routes } from 'react-router';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import AuthPage from './pages/AuthPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ShopPage from './pages/ShopPage.jsx';
import SupplierPage from './pages/SupplierPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';

const App = () => {
  return <div>
  <Routes>
    <Route path="/" element={<AuthPage />} />

    {/* Shop-only routes */}
    <Route element={<ProtectedRoute allowedRoles={["shop"]} />}>
        <Route path="/shop/:id" element={<ShopPage />} />
    </Route>

    {/* Supplier-only routes */}
    <Route element={<ProtectedRoute allowedRoles={["supplier"]} />}>
        <Route path="/supplier/:id" element={<SupplierPage />} />
    </Route>

    {/* Shared pages */}
    <Route element={<ProtectedRoute allowedRoles={["shop", "supplier"]} />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/:id/analytics" element={<AnalyticsPage />} />
    </Route>
  </Routes>

  </div>
}

export default App