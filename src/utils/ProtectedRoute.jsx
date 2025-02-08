import {Navigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";

const ProtectedRoute = ({children, requiredRole}) => {
    const {user} = useAuth();

    if (!user) return null;

    const rolesHierarchy = ["guest", "staff", "admin"];
    const userIndex = rolesHierarchy.indexOf(user);
    const requiredIndex = rolesHierarchy.indexOf(requiredRole);

    if (user === "guest") {
        return <Navigate to="/staff/login" />;
    }

    return userIndex >= requiredIndex ? children : <NotFoundPage/>;
};

export default ProtectedRoute;
