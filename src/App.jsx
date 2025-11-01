import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SnippetProvider } from "./contexts/SnippetContext";
import { CollectionProvider } from "./contexts/CollectionContext";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import PasswordResetForm from "./components/auth/PasswordResetForm";
import AuthGuard from "./components/auth/AuthGuard";
import MainLayout from "./components/layout/MainLayout";
import AllSnippets from "./pages/AllSnippets";
import Collections from "./pages/Collections";
import CreateSnippet from "./pages/CreateSnippet";
import EditSnippet from "./pages/EditSnippet";
import SnippetDetailPage from "./pages/SnippetDetailPage";
import Search from "./pages/Search";
import Tags from "./pages/Tags";
import Shared from "./pages/Shared";
import ImportExport from "./pages/ImportExport";
import Settings from "./pages/Settings";
import CodeDisplayDemo from "./components/snippets/CodeDisplayDemo";
import SnippetListDemo from "./pages/SnippetListDemo";
import SnippetDetailDemo from "./pages/SnippetDetailDemo";
import SearchDemo from "./pages/SearchDemo";
import CollectionDemo from "./pages/CollectionDemo";
import TaggingDemo from "./pages/TaggingDemo";
import SharingDemo from "./pages/SharingDemo";
import ImportExportDemo from "./pages/ImportExportDemo";
import DemoHub from "./pages/DemoHub";

// Wrapper component to provide SnippetContext and CollectionContext with userId
const SnippetProviderWrapper = ({ children }) => {
  const { user } = useAuth();
  return (
    <SnippetProvider userId={user?.uid}>
      <CollectionProvider userId={user?.uid}>{children}</CollectionProvider>
    </SnippetProvider>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/reset-password" element={<PasswordResetForm />} />

          {/* Demo routes (outside main layout) */}
          <Route path="/demos" element={<DemoHub />} />
          <Route path="/demo/code-display" element={<CodeDisplayDemo />} />
          <Route
            path="/demo/snippet-list"
            element={
              <AuthGuard>
                <SnippetProviderWrapper>
                  <SnippetListDemo />
                </SnippetProviderWrapper>
              </AuthGuard>
            }
          />
          <Route path="/demo/snippet-detail" element={<SnippetDetailDemo />} />
          <Route path="/demo/search" element={<SearchDemo />} />
          <Route path="/demo/collections" element={<CollectionDemo />} />
          <Route
            path="/demo/tagging"
            element={
              <AuthGuard>
                <SnippetProviderWrapper>
                  <TaggingDemo />
                </SnippetProviderWrapper>
              </AuthGuard>
            }
          />
          <Route path="/demo/sharing" element={<SharingDemo />} />
          <Route path="/demo/import-export" element={<ImportExportDemo />} />

          {/* Protected routes with MainLayout */}
          <Route
            element={
              <AuthGuard>
                <SnippetProviderWrapper>
                  <MainLayout />
                </SnippetProviderWrapper>
              </AuthGuard>
            }
          >
            <Route path="/" element={<AllSnippets />} />
            <Route
              path="/collections/:collectionId"
              element={<Collections />}
            />
            <Route path="/search" element={<Search />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/shared" element={<Shared />} />
            <Route path="/import-export" element={<ImportExport />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/snippets/new" element={<CreateSnippet />} />
            <Route path="/snippets/:id" element={<SnippetDetailPage />} />
            <Route path="/snippets/:id/edit" element={<EditSnippet />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
