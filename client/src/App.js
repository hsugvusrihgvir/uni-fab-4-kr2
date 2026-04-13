import React, { useEffect, useState } from "react";
import ProductsPage from "./pages/UsersPage/ProductsPage";
import { api, clearTokens, getAccessToken, getRefreshToken, setTokens } from "./api";

function AuthForm({ mode, onSwitchMode, onSuccess }) {
    const isLogin = mode === "login";

    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (isLogin) {
                const data = await api.login({
                    email: email.trim(),
                    password,
                });

                setTokens(data.accessToken, data.refreshToken);

                const me = await api.getMe();
                onSuccess(me);
            } else {
                await api.register({
                    email: email.trim(),
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                    password,
                });

                alert("Пользователь успешно зарегистрирован. Теперь выполните вход.");
                onSwitchMode("login");
                setPassword("");
            }
        } catch (err) {
            console.error(err);
            const message =
                err?.response?.data?.error || "Произошла ошибка";
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <header className="header">
                <div className="header__inner">
                    <div className="brand">магазин</div>
                </div>
            </header>

            <main className="main">
                <div className="container" style={{ maxWidth: 520 }}>
                    <div className="toolbar">
                        <h1 className="title">{isLogin ? "Вход" : "Регистрация"}</h1>
                    </div>

                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 16,
                            padding: 20,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                        }}
                    >
                        <form className="form" onSubmit={handleSubmit}>
                            <label className="label">
                                Email
                                <input
                                    className="input"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="test@example.com"
                                    required
                                />
                            </label>

                            {!isLogin && (
                                <>
                                    <label className="label">
                                        Имя
                                        <input
                                            className="input"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="Имя"
                                            required
                                        />
                                    </label>

                                    <label className="label">
                                        Фамилия
                                        <input
                                            className="input"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Фамидия"
                                            required
                                        />
                                    </label>
                                </>
                            )}

                            <label className="label">
                                Пароль
                                <input
                                    className="input"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Введите пароль"
                                    required
                                />
                            </label>

                            <div className="modal__footer">
                                <button type="submit" className="btn btn--primary" disabled={loading}>
                                    {loading
                                        ? "Загрузка..."
                                        : isLogin
                                            ? "Войти"
                                            : "Зарегистрироваться"}
                                </button>

                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => onSwitchMode(isLogin ? "register" : "login")}
                                >
                                    {isLogin ? "К регистрации" : "Ко входу"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function App() {
    const [mode, setMode] = useState("login");
    const [currentUser, setCurrentUser] = useState(null);
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        const init = async () => {
            const accessToken = getAccessToken();
            const refreshToken = getRefreshToken();

            if (!accessToken || !refreshToken) {
                setCheckingAuth(false);
                return;
            }

            try {
                const me = await api.getMe();
                setCurrentUser(me);
            } catch (err) {
                console.error(err);
                clearTokens();
                setCurrentUser(null);
            } finally {
                setCheckingAuth(false);
            }
        };

        init();
    }, []);

    const handleAuthSuccess = (user) => {
        setCurrentUser(user);
    };

    const handleLogout = () => {
        clearTokens();
        setCurrentUser(null);
        setMode("login");
    };

    if (checkingAuth) {
        return <div className="empty">Проверка авторизации...</div>;
    }

    if (!currentUser) {
        return (
            <div className="App">
                <AuthForm
                    mode={mode}
                    onSwitchMode={setMode}
                    onSuccess={handleAuthSuccess}
                />
            </div>
        );
    }

    return (
        <div className="App">
            <ProductsPage currentUser={currentUser} onLogout={handleLogout} />
        </div>
    );
}