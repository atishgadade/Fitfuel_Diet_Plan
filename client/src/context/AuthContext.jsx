import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, deleteUser } from "firebase/auth";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);       // Firebase Auth user
    const [userData, setUserData] = useState(null); // Firestore user profile
    const [loading, setLoading] = useState(true);   // Initial auth check

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                try {
                    const userRef = doc(db, "users", firebaseUser.uid);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        setUserData(userSnap.data());
                    } else {
                        setUserData(null);
                    }
                } catch (err) {
                    console.error("Error fetching user data:", err);
                    setUserData(null);
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    /** Refresh user data from Firestore (call after profile updates) */
    const refreshUserData = async () => {
        if (!user) return;
        try {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setUserData(userSnap.data());
            }
        } catch (err) {
            console.error("Error refreshing user data:", err);
        }
    };

    /** Logout */
    const handleLogout = async (navigate) => {
        await signOut(auth);
        toast.success("👋 Logged out successfully!");
        navigate("/");
    };

    /** Delete Account */
    const handleDeleteAccount = async (navigate) => {
        const confirmDelete = window.confirm(
            "⚠️ Are you sure you want to delete your account? This action cannot be undone and all your saved data will be lost."
        );

        if (!confirmDelete) return;

        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
            await deleteDoc(doc(db, "users", currentUser.uid));
            await deleteUser(currentUser);
            toast.success("✅ Account deleted successfully.");
            navigate("/");
        } catch (error) {
            console.error("Error deleting account:", error);
            if (error.code === "auth/requires-recent-login") {
                toast.error(
                    "⚠️ For security, please log out and log back in, then try deleting your account again."
                );
            } else {
                toast.error("❌ Failed to delete account: " + error.message);
            }
        }
    };

    const value = {
        user,
        userData,
        loading,
        refreshUserData,
        handleLogout,
        handleDeleteAccount,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
