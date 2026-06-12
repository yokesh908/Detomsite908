/*
 * React hooks for authentication
 */
import { useAuthStore } from "../store/auth";
import api from "../services/api";

export const useAuth = () => {
  const store = useAuthStore();

  const login = async (email: string, password: string) => {
    try {
      store.setLoading(true);
      store.setError(null);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { access_token, refresh_token } = response.data;
      store.setTokens(access_token, refresh_token);

      // Save tokens to localStorage
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      // Fetch user profile
      const profileResponse = await api.get("/auth/me");
      store.setUser(profileResponse.data);

      return true;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Login failed";
      store.setError(errorMessage);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string
  ) => {
    try {
      store.setLoading(true);
      store.setError(null);

      await api.post("/auth/register", {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role,
      });

      return true;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Registration failed";
      store.setError(errorMessage);
      return false;
    } finally {
      store.setLoading(false);
    }
  };

  const logout = () => {
    store.logout();
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  };

  return {
    ...store,
    login,
    register,
    logout,
  };
};
