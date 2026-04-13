import React, { useEffect, useState } from "react";
import "./ProductsPage.scss";
import ProductsList from "../../components/ProductsList";
import ProductModal from "../../components/ProductModal";
import { api } from "../../api";

export default function ProductsPage({ currentUser, onLogout }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [editingProduct, setEditingProduct] = useState(null);

    const [searchId, setSearchId] = useState("");
    const [foundProduct, setFoundProduct] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await api.getProducts();
            setProducts(data);
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.error || "Ошибка загрузки товаров");
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setModalMode("create");
        setEditingProduct(null);
        setModalOpen(true);
    };

    const openEdit = (product) => {
        setModalMode("edit");
        setEditingProduct(product);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingProduct(null);
    };

    const handleDelete = async (id) => {
        const ok = window.confirm("Удалить товар?");
        if (!ok) return;

        try {
            await api.deleteProduct(id);
            setProducts((prev) => prev.filter((p) => p.id !== id));

            if (foundProduct?.id === id) {
                setFoundProduct(null);
            }
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.error || "Ошибка удаления товара");
        }
    };

    const handleSubmitModal = async (payload) => {
        try {
            if (modalMode === "create") {
                const newProduct = await api.createProduct(payload);
                setProducts((prev) => [...prev, newProduct]);
            } else {
                const updatedProduct = await api.updateProduct(payload.id, payload);
                setProducts((prev) =>
                    prev.map((p) => (p.id === payload.id ? updatedProduct : p))
                );

                if (foundProduct?.id === payload.id) {
                    setFoundProduct(updatedProduct);
                }
            }

            closeModal();
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.error || "Ошибка сохранения товара");
        }
    };

    const handleFindById = async (e) => {
        e.preventDefault();

        const trimmedId = searchId.trim();
        if (!trimmedId) {
            alert("Введите id товара");
            return;
        }

        try {
            setSearchLoading(true);
            const product = await api.getProductById(trimmedId);
            setFoundProduct(product);
        } catch (err) {
            console.error(err);
            setFoundProduct(null);
            alert(err?.response?.data?.error || "Товар не найден");
        } finally {
            setSearchLoading(false);
        }
    };

    return (
        <div className="page">
            <header className="header">
                <div className="header__inner">
                    <div className="brand">магазин</div>
                    <button className="btn" onClick={onLogout}>
                        Выйти
                    </button>
                </div>
            </header>

            <main className="main">
                <div className="container">
                    <div className="toolbar">
                        <div>
                            <h1 className="title">Товары</h1>
                            <div style={{ marginTop: 8, opacity: 0.8 }}>
                                Текущий пользователь: {currentUser.email}
                            </div>
                        </div>

                        <button className="btn btn--primary" onClick={openCreate}>
                            Создать
                        </button>
                    </div>

                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 16,
                            padding: 20,
                            marginBottom: 20,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                        }}
                    >
                        <form className="form" onSubmit={handleFindById}>
                            <label className="label">
                                Найти товар по id
                                <input
                                    className="input"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    placeholder="Введите id товара"
                                />
                            </label>

                            <div className="modal__footer">
                                <button type="submit" className="btn btn--primary">
                                    {searchLoading ? "Поиск..." : "Получить товар"}
                                </button>
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => {
                                        setSearchId("");
                                        setFoundProduct(null);
                                    }}
                                >
                                    Очистить
                                </button>
                            </div>
                        </form>

                        {foundProduct && (
                            <div style={{ marginTop: 20 }}>
                                <h3 style={{ marginBottom: 12 }}>Найденный товар</h3>
                                <ProductsList
                                    products={[foundProduct]}
                                    onEdit={openEdit}
                                    onDelete={handleDelete}
                                />
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="empty">Загрузка...</div>
                    ) : (
                        <ProductsList
                            products={products}
                            onEdit={openEdit}
                            onDelete={handleDelete}
                        />
                    )}
                </div>
            </main>

            <ProductModal
                open={modalOpen}
                mode={modalMode}
                initialProduct={editingProduct}
                onClose={closeModal}
                onSubmit={handleSubmitModal}
            />
        </div>
    );
}