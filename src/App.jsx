import { BrowserRouter, Routes, Route } from "react-router-dom";
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;