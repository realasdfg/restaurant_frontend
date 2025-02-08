import {Navigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";

const ProtectedRoute = ({children, requiredRole}) => {
    const {userRole} = useAuth();

    if (!userRole) return null;

    const rolesHierarchy = ["guest", "staff", "admin"];
    const userIndex = rolesHierarchy.indexOf(userRole);
    const requiredIndex = rolesHierarchy.indexOf(requiredRole);

    if (userRole === "guest") {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return <Navigate to="/staff/login"/>;
    }

    return userIndex >= requiredIndex ? children : <NotFoundPage/>;
};

export default ProtectedRoute;
