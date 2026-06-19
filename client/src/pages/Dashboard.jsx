import { useNavigate } from 'react-router-dom';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import SupplierDashboard from './SupplierDashboard';
import ProducerDashboard from './ProducerDashboard';
import WellnessDashboard from './WellnessDashboard';
import AdminDashboard from './AdminDashboard';
import Layout from '../components/Layout';

const Dashboard = () => {
    const navigate = useNavigate();
    let userInfo = null;

    try {
        const storedUser = localStorage.getItem('userInfo');
        userInfo = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        console.error('Error parsing userInfo:', error);
        localStorage.removeItem('userInfo');
    }

    if (!userInfo) {
        setTimeout(() => navigate('/login'), 100);
        return <div className="p-10 text-center">Redirecting to Login...</div>;
    }

    const renderDashboard = () => {
        switch (userInfo.role) {
            case 'patient': return <PatientDashboard />;
            case 'doctor': return <DoctorDashboard />;
            case 'supplier': return <SupplierDashboard />;
            case 'producer': return <ProducerDashboard />;
            case 'wellness_staff': return <WellnessDashboard />;
            case 'admin': return <AdminDashboard />;
            default:
                return (
                    <div className="space-y-6">
                        <h1 className="text-4xl font-black text-primary">Welcome, {userInfo.name}</h1>
                        <p className="text-lg text-muted">Your role <span className="text-accent font-bold uppercase tracking-widest text-sm bg-accent/10 px-3 py-1 rounded-full">{userInfo.role}</span> is not yet configured with a custom dashboard.</p>
                    </div>
                );
        }
    };

    return (
        <Layout>
            {renderDashboard()}
        </Layout>
    );
};

export default Dashboard;
