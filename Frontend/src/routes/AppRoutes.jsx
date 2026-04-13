import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Login from "../pages/Login";
import Register from "../pages/Register";
import CreateQuiz from "../pages/QuizMaster/CreateQuiz";
import QuizList from "../pages/QuizMaster/QuizList";
import AddQuestion from "../pages/QuizMaster/AddQuestion";
import JoinQuiz from "../pages/Participant/JoinQuiz";
import PlayQuiz from "../pages/Participant/PlayQuiz";
import Result from "../pages/Participant/Result";
import Leaderboard from "../pages/Participant/Leaderboard";
import QuizDetails from "../pages/QuizMaster/QuizDetails";
import EditQuiz from "../pages/QuizMaster/EditQuiz";
import EditQuestion from "../pages/QuizMaster/EditQuestion";
import SuperAdminDashboard from "../pages/SuperAdmin/SuperAdminDashboard";
import QuizMasterDashboard from "../pages/QuizMaster/QuizMasterDashboard";
import ParticipantDashboard from "../pages/Participant/ParticipantDashboard";
import QuizLandingPage from "../pages/QuizLandingPage";
import RoleRoute from "./RoleRoute";
import DashboardLayout from "../pages/QuizMaster/DashboardLayout";
import QuizMasters from "../pages/SuperAdmin/QuizMasters";
import Members from "../pages/SuperAdmin/Members";
import AllQuizzes from "../pages/SuperAdmin/AllQuizzes";
import Reports from "../pages/SuperAdmin/Reports";
import MyQuizzes from "../pages/Participant/MyQuizzes";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

const AuthLoader = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "16px",
        fontWeight: "600",
      }}
    >
      Loading...
    </div>
  );
};

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, authReady } = useAuth();
  const location = useLocation();

  if (!authReady) {
    return <AuthLoader />;
  }

  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

const DashboardRoute = ({ children }) => {
  return (
    <PrivateRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </PrivateRoute>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<QuizLandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/all-quizzes"
        element={
          <DashboardRoute>
            <RoleRoute allowedRoles={["super_admin"]}>
              <AllQuizzes />
            </RoleRoute>
          </DashboardRoute>
        }
      />


<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route
        path="/reports"
        element={
          <DashboardRoute>
            <RoleRoute allowedRoles={["super_admin"]}>
              <Reports />
            </RoleRoute>
          </DashboardRoute>
        }
      />

      <Route
        path="/super-admin-dashboard"
        element={
          <DashboardRoute>
            <RoleRoute allowedRoles={["super_admin"]}>
              <SuperAdminDashboard />
            </RoleRoute>
          </DashboardRoute>
        }
      />

      <Route
        path="/members"
        element={
          <DashboardRoute>
            <RoleRoute allowedRoles={["super_admin"]}>
              <Members />
            </RoleRoute>
          </DashboardRoute>
        }
      />

      <Route
        path="/quiz-master-dashboard"
        element={
          <DashboardRoute>
            <RoleRoute allowedRoles={["quiz_master"]}>
              <QuizMasterDashboard />
            </RoleRoute>
          </DashboardRoute>
        }
      />

      <Route
        path="/quiz-masters"
        element={
          <DashboardRoute>
            <RoleRoute allowedRoles={["super_admin"]}>
              <QuizMasters />
            </RoleRoute>
          </DashboardRoute>
        }
      />

      <Route
        path="/participant-dashboard"
        element={
          <DashboardRoute>
            <RoleRoute allowedRoles={["participant"]}>
              <ParticipantDashboard />
            </RoleRoute>
          </DashboardRoute>
        }
      />
      <Route
  path="/participant-quizzes"
  element={
    <DashboardRoute>
      <RoleRoute allowedRoles={["participant"]}>
        <MyQuizzes />
      </RoleRoute>
    </DashboardRoute>
  }
/>

      <Route
        path="/create-quiz"
        element={
          <DashboardRoute>
            <RoleRoute allowedRoles={["super_admin", "quiz_master"]}>
              <CreateQuiz />
            </RoleRoute>
          </DashboardRoute>
        }
      />

      <Route
        path="/quizzes"
        element={
          <DashboardRoute>
            <RoleRoute allowedRoles={["super_admin", "quiz_master"]}>
              <QuizList />
            </RoleRoute>
          </DashboardRoute>
        }
      />

      <Route
        path="/quizzes/:quizId"
        element={
          <DashboardRoute>
            <RoleRoute allowedRoles={["super_admin", "quiz_master"]}>
              <QuizDetails />
            </RoleRoute>
          </DashboardRoute>
        }
      />

      <Route
        path="/quizzes/edit/:quizId"
        element={
          <DashboardRoute>
            <RoleRoute allowedRoles={["super_admin", "quiz_master"]}>
              <EditQuiz />
            </RoleRoute>
          </DashboardRoute>
        }
      />

      <Route
        path="/add-question"
        element={
          <DashboardRoute>
            <RoleRoute allowedRoles={["super_admin", "quiz_master"]}>
              <AddQuestion />
            </RoleRoute>
          </DashboardRoute>
        }
      />

      <Route
        path="/questions/edit/:questionId"
        element={
          <DashboardRoute>
            <RoleRoute allowedRoles={["super_admin", "quiz_master"]}>
              <EditQuestion />
            </RoleRoute>
          </DashboardRoute>
        }
      />

      <Route
        path="/join-quiz"
        element={
          <DashboardRoute>
            <RoleRoute allowedRoles={["participant"]}>
              <JoinQuiz />
            </RoleRoute>
          </DashboardRoute>
        }
      />

      <Route
  path="/play-quiz/:quizId"
  element={
    <PrivateRoute>
      <RoleRoute allowedRoles={["participant"]}>
        <PlayQuiz />
      </RoleRoute>
    </PrivateRoute>
  }
/>

      <Route
        path="/result/:quizId"
        element={
          <DashboardRoute>
            <RoleRoute
              allowedRoles={["participant", "quiz_master", "super_admin"]}
            >
              <Result />
            </RoleRoute>
          </DashboardRoute>
        }
      />

      <Route
        path="/leaderboard/:quizId"
        element={
          <DashboardRoute>
            <RoleRoute
              allowedRoles={["participant", "quiz_master", "super_admin"]}
            >
              <Leaderboard />
            </RoleRoute>
          </DashboardRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;