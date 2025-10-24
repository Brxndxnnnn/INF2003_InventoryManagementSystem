import { Route, Routes } from 'react-router';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import AuthPage from './pages/AuthPage.jsx';
import HomePage from './pages/HomePage.jsx';
import ShopPage from './pages/ShopPage.jsx';
import SupplierPage from './pages/SupplierPage.jsx';

const App = () => {
  return <div>
    <Routes>
      {/* Public routes */}
      <Route path='/' element={<AuthPage/>} />

      {/* Protected routes (need login first) */}
      <Route element={<ProtectedRoute/>}>
            <Route path='/home' element={<HomePage/>} />
            <Route path='/shop/:id' element={<ShopPage/>} />
            <Route path='/supplier/:id' element={<SupplierPage/>} />
      </Route>
    </Routes>
  </div>
}

export default App