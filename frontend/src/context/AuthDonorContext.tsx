// context/AuthDonorContext.tsx
import React, { createContext, useState, useEffect } from "react";

type Donor = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
};

type AuthContextType = {
    donor: Donor | null;
    login: (donor: Donor, token?: string) => void;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [donor, setDonor] = useState<Donor | null>(null);

    useEffect(() => {
        const savedDonor = localStorage.getItem("donor");
        if (savedDonor) {
            setDonor(JSON.parse(savedDonor));
        }
    }, []);

    const login = (donorData: Donor, token?: string) => {
        setDonor(donorData);
        localStorage.setItem("donor", JSON.stringify(donorData));
        if (token) localStorage.setItem("authToken", token); // if backend gives JWT
    };

    const logout = () => {
        setDonor(null);
        localStorage.removeItem("donor");
        localStorage.removeItem("authToken");
    };

    return (
        <AuthContext.Provider value={{ donor, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
