import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Layout } from "./components/Layout";
import { Toaster } from "./components/Toast";
import { requestPersistentStorage } from "./lib/persist";
import { startSync } from "./lib/syncController";
import { Anatomy } from "./pages/Anatomy";
import { Backup } from "./pages/Backup";
import { Calculators } from "./pages/Calculators";
import { Capstone } from "./pages/Capstone";
import { Dashboard } from "./pages/Dashboard";
import { Flashcards } from "./pages/Flashcards";
import { Focus } from "./pages/Focus";
import { LessonPage, Lessons } from "./pages/Lessons";
import { NotFound } from "./pages/NotFound";
import { QuickRef } from "./pages/QuickRef";
import { Glossary, LaunchPrep, Resources } from "./pages/Reference";
import { Roadmap } from "./pages/Roadmap";
import { ToolPage, Tools } from "./pages/Tools";
import { WeekPage } from "./pages/WeekPage";

export default function App() {
  const { pathname } = useLocation();
  // Once per load, after unlock: ask the browser to keep storage, then start sync if it's set up.
  useEffect(() => {
    void requestPersistentStorage();
    startSync();
  }, []);
  return (
    <Layout>
      <ErrorBoundary resetKey={pathname}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/week/:n" element={<WeekPage />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/lessons/:slug" element={<LessonPage />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/:tool" element={<ToolPage />} />
          <Route path="/calculators" element={<Calculators />} />
          <Route path="/capstone" element={<Capstone />} />
          <Route path="/anatomy" element={<Anatomy />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/reference" element={<QuickRef />} />
          <Route path="/launch" element={<LaunchPrep />} />
          <Route path="/backup" element={<Backup />} />
          <Route path="/focus/:id" element={<Focus />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
      <Toaster />
    </Layout>
  );
}
