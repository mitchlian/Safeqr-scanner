import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScannerPage from "./pages/ScannerPage";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ScannerPage />} />
        <Route path="/admin/:token" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;