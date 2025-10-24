import { Navigate, Outlet } from "react-router";

// Checks if theres a valid user session, otherwise redirect to login page
const ProtectedRoute = () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const isLoggedIn = user?.isLoggedIn

    if (!isLoggedIn) {
    return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
