import { Route, Routes } from "react-router";
import Layout from "@/components/Layout";
import ErrorBoundary from "@/components/ErrorBoundary";
import RequireAdmin from "@/components/RequireAdmin";
import Home from "@/pages/Home";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import AdminProjects from "@/pages/AdminProjects";
import NotFound from "@/pages/NotFound";
import AdminExperience from "@/pages/AdminExperience";

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:slug" element={<ProjectDetail />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route
            path="admin/projects"
            element={
              <RequireAdmin>
                <AdminProjects />
              </RequireAdmin>
            }
          />
          <Route
            path="admin/experiences"
            element={
              <RequireAdmin>
                <AdminExperience />
              </RequireAdmin>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
