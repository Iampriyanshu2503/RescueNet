import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState } from '../store';
import { loginUser, registerUser, logout, clearError, fetchUserProfile } from '../store/authSlice';
import { LoginRequest, RegisterRequest } from '../types/auth';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      return dispatch(loginUser(credentials));
    },
    [dispatch]
  );

  const register = useCallback(
    async (userData: RegisterRequest) => {
      return dispatch(registerUser(userData));
    },
    [dispatch]
  );

  const logoutUser = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const getProfile = useCallback(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    ...auth,
    login,
    register,
    logout: logoutUser,
    getProfile,
    clearError: clearAuthError,
  };
};

export default useAuth;
