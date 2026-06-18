import { useParams, Navigate } from "react-router-dom";

function AdminPage() {
    const {token} = useParams();

    const validToken = "FYP2026Admin";

    if (token !== validToken) {
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