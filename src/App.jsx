import { BrowserRouter, Routes, Route , Navigate } from "react-router-dom";
import ScannerPage from "./pages/ScannerPage";
import AdminPage from "./pages/AdminPage";
import Header from "./components/Header";

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<ScannerPage />} />
        <Route path="/admin/:token" element={<AdminPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;