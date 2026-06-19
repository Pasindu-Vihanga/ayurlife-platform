import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';

import BookAppointment from './pages/BookAppointment';
import CreatePrescription from './pages/CreatePrescription';
import BookTherapy from './pages/BookTherapy';
import HerbShop from './pages/HerbShop';
import Symptoms from './pages/Symptoms';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorPatients from './pages/DoctorPatients';
import DoctorAvailability from './pages/DoctorAvailability';
import ProductionDashboard from './pages/ProductionDashboard';
import ProductionManage from './pages/ProductionManage';
import SupplierDashboard from './pages/SupplierDashboard';
import WellnessServices from './pages/WellnessServices';
import AdminDashboard from './pages/AdminDashboard';
import AdminSettings from './pages/AdminSettings';
import Knowledge from './pages/Knowledge';

function App() {
  return (
    <div className="min-h-screen bg-surface dark:bg-darkSurface text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/herb-shop" element={<HerbShop />} />
        <Route path="/book-therapy" element={<BookTherapy />} />
        <Route path="/symptoms" element={<Symptoms />} />
        <Route path="/prescription/:appointmentId" element={<CreatePrescription />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/doctor/patients" element={<DoctorPatients />} />
        <Route path="/doctor/availability" element={<DoctorAvailability />} />
        <Route path="/production" element={<ProductionDashboard />} />
        <Route path="/production/manage" element={<ProductionManage />} />
        <Route path="/wellness/services" element={<Layout><WellnessServices /></Layout>} />
        <Route path="/inventory-manage" element={<Layout><SupplierDashboard /></Layout>} />
        <Route path="/admin/dashboard" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/knowledge" element={<Knowledge />} />
        <Route path="/test" element={<div className="p-20 text-5xl font-bold text-primary">Frontend is Working!</div>} />
      </Routes>
    </div>
  );
}

export default App;
