import axios from "axios";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken, refreshToken) {
    if (accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
}

export function clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
}

const apiClient = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
        accept: "application/json",
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const accessToken = getAccessToken();

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!error.response) {
            return Promise.reject(error);
        }

        const isUnauthorized = error.response.status === 401;
        const isRetryRequest = originalRequest?._retry;
        const isRefreshRequest = originalRequest?.url?.includes("/auth/refresh");
        const isLoginRequest = originalRequest?.url?.includes("/auth/login");
        const isRegisterRequest = originalRequest?.url?.includes("/auth/register");

        if (
            isUnauthorized &&
            !isRetryRequest &&
            !isRefreshRequest &&
            !isLoginRequest &&
            !isRegisterRequest
        ) {
            const refreshToken = getRefreshToken();

            if (!refreshToken) {
                clearTokens();
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                const refreshResponse = await axios.post(
                    "http://localhost:3000/api/auth/refresh",
                    {},
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "x-refresh-token": refreshToken,
                        },
                    }
                );

                const newAccessToken = refreshResponse.data.accessToken;
                const newRefreshToken = refreshResponse.data.refreshToken;

                setTokens(newAccessToken, newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return apiClient(originalRequest);
            } catch (refreshError) {
                clearTokens();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const api = {
    register: async (payload) => {
        const response = await apiClient.post("/auth/register", payload);
        return response.data;
    },

    login: async (payload) => {
        const response = await apiClient.post("/auth/login", payload);
        return response.data;
    },

    refresh: async () => {
        const refreshToken = getRefreshToken();

        const response = await apiClient.post(
            "/auth/refresh",
            {},
            {
                headers: {
                    "x-refresh-token": refreshToken,
                },
            }
        );

        return response.data;
    },

    getMe: async () => {
        const response = await apiClient.get("/auth/me");
        return response.data;
    },

    createProduct: async (product) => {
        const response = await apiClient.post("/products", product);
        return response.data;
    },

    getProducts: async () => {
        const response = await apiClient.get("/products");
        return response.data;
    },

    getProductById: async (id) => {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
    },

    updateProduct: async (id, product) => {
        const response = await apiClient.put(`/products/${id}`, product);
        return response.data;
    },

    deleteProduct: async (id) => {
        const response = await apiClient.delete(`/products/${id}`);
        return response.data;
    },
};