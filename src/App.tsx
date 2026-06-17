import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/Login/Login';
import StudentDashboard from '@/pages/Student/StudentDashboard';
import StudentRegister from '@/pages/Student/StudentRegister';
import StudentTraining from '@/pages/Student/StudentTraining';
import StudentHours from '@/pages/Student/StudentHours';
import StudentExam from '@/pages/Student/StudentExam';
import StudentRefund from '@/pages/Student/StudentRefund';
import MessageCenter from '@/pages/Messages/MessageCenter';
import CoachDashboard from '@/pages/Coach/CoachDashboard';
import CoachSignIn from '@/pages/Coach/CoachSignIn';
import CoachStudents from '@/pages/Coach/CoachStudents';
import CoachStatistics from '@/pages/Coach/CoachStatistics';
import ExamDashboard from '@/pages/Exam/ExamDashboard';
import ExamRooms from '@/pages/Exam/ExamRooms';
import ExamAppointments from '@/pages/Exam/ExamAppointments';
import FinanceDashboard from '@/pages/Finance/FinanceDashboard';
import FinanceRefunds from '@/pages/Finance/FinanceRefunds';
import PrincipalDashboard from '@/pages/Principal/PrincipalDashboard';
import PrincipalReports from '@/pages/Principal/PrincipalReports';
import PrincipalDaily from '@/pages/Principal/PrincipalDaily';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/register" element={<StudentRegister />} />
        <Route path="/student/training" element={<StudentTraining />} />
        <Route path="/student/hours" element={<StudentHours />} />
        <Route path="/student/exam" element={<StudentExam />} />
        <Route path="/student/refund" element={<StudentRefund />} />
        <Route path="/student/messages" element={<MessageCenter role="student" />} />

        <Route path="/coach/dashboard" element={<CoachDashboard />} />
        <Route path="/coach/signin" element={<CoachSignIn />} />
        <Route path="/coach/students" element={<CoachStudents />} />
        <Route path="/coach/statistics" element={<CoachStatistics />} />
        <Route path="/coach/messages" element={<MessageCenter role="coach" />} />

        <Route path="/exam/dashboard" element={<ExamDashboard />} />
        <Route path="/exam/rooms" element={<ExamRooms />} />
        <Route path="/exam/appointments" element={<ExamAppointments />} />
        <Route path="/exam/messages" element={<MessageCenter role="exam_admin" />} />

        <Route path="/finance/dashboard" element={<FinanceDashboard />} />
        <Route path="/finance/refunds" element={<FinanceRefunds />} />
        <Route path="/finance/messages" element={<MessageCenter role="finance" />} />

        <Route path="/principal/dashboard" element={<PrincipalDashboard />} />
        <Route path="/principal/reports" element={<PrincipalReports />} />
        <Route path="/principal/daily" element={<PrincipalDaily />} />
        <Route path="/principal/messages" element={<MessageCenter role="principal" />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
