import {createContext, useContext, useEffect, useMemo, useState} from "react";
import axiosInstance, {setAuthInfoUpdater} from "./axiosConfig.jsx";

const AuthContext = createContext();

// eslint-disable-next-line react/prop-types
export const AuthProvider = ({ children }) => {
    const [authInfo, setAuthInfo] = useState(() => {
        const savedAuthInfo = localStorage.getItem('authInfo');
        return savedAuthInfo ? JSON.parse(savedAuthInfo) : { authenticated: false, registrationCompleted: false };
    });

    const [authError, setAuthError] = useState("")

    function resetAuthError(){
        setAuthError("")
    }

    useEffect(() => {
        localStorage.setItem('authInfo', JSON.stringify(authInfo));
    }, [authInfo]);

    useEffect(() => {
        setAuthInfoUpdater(setAuthInfo);
    }, []);

    // call this function when you want to authenticate the user
    const login = async (credentials) => {

        try {

            const loginRes = await axiosInstance.post("login", JSON.stringify(credentials));
            console.log("loginRes", loginRes.status);

            if (loginRes.status !== 200) {
                setAuthError("Wrong email address or password");
                return; // Stop further execution if login fails
            }

            const userDataRes = await axiosInstance.post("me", undefined, { withCredentials: true });
            console.log("userData", userDataRes.data);

            setAuthInfo(prevState => ({
                ...prevState,
                authenticated: true,
                registrationCompleted: userDataRes.data["completed"],
            }));
        } catch (error) {
            console.log(error);

            setAuthInfo(prevState => ({
                ...prevState,
                authenticated: false,
                registrationCompleted: false,
            }));
        }
    }

    // call this function to sign out logged in user
    const logout = () => {
        axiosInstance.post("logout", undefined,{withCredentials: true})
            .then(() => {
                localStorage.removeItem('authInfo');
                setAuthInfo(prevState => ({
                    ...prevState,
                    authenticated: false,
                    registrationCompleted: false
                }))

            })
    };

    const value = useMemo(() => ({
        login,
        logout,
        setAuthInfo,
        authInfo,
        authError,
        resetAuthError
    }), [authInfo, authError]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};
