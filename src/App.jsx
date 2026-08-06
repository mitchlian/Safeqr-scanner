import { BrowserRouter, Routes, Route , Navigate, useLocation } from "react-router-dom";
import ScannerPage from "./pages/ScannerPage";
import AdminPage from "./pages/AdminPage";
import Header from "./components/Header";

function Layout() {

  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Header />}

      <Routes>
        <Route path="/" element={<ScannerPage />} />
        <Route path="/admin/:token" element={<AdminPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;