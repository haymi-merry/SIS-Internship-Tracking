import { Routes as RouterRoutes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { AdvisorLogin } from './pages/advisor/Login';
import { AdvisorSignup } from './pages/advisor/SignUp';
// import {AdvisorProfile} from './pages/advisor/Profile'
import Profile from './pages/advisor/Profile';
import { AdminLogin } from './pages/Admin/Login';
import { AdminDashboard } from './pages/Admin/Dashboard';
import { AdvisorDashboard } from './pages/advisor/dashboard/AdvisorDashboard'; 
import { StudentDetailView } from './pages/advisor/dashboard/StudentDetailView';

export const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<Home />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/advisor/login" element={<AdvisorLogin />} />
       <Route path="/advisor/login" element={<AdvisorLogin />} />
      <Route path="/advisor/signup" element={<AdvisorSignup />} /> 

      <Route path="/advisor/profile" element={<Profile />} /> {/* New route */}
      <Route path="/advisor/dashboard" element={<AdvisorDashboard />} /> {/* New route */}
      <Route path="/advisor/students/:universityId" element={<StudentDetailView />} />
      <Route path="/advisor/students/:prefix/:middle/:suffix" element={<StudentDetailView />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      
    </RouterRoutes>
  );
};