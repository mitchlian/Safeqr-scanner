import { useSearchParams, Navigate } from "react-router-dom";

function AdminPage() {
  const {token} = useParams();

  if (token !== "FYP2026Admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <h1>Admin Dashboard</h1>
      <p>Only accessible with the correct token.</p>
    </>
  );
}

export default AdminPage;