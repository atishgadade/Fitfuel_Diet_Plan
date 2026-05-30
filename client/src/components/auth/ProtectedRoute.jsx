import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";

const ProtectedRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user);
        });
        return () => unsubscribe();
    }, []);

    if (isAuthenticated === null) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#11221a' }}>
                <h3 style={{ color: 'white' }}>Loading...</h3>
            </div>
        );
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login_signup" replace />;
};

export default ProtectedRoute;
