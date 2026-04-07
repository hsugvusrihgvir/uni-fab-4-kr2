import React, { useEffect, useState } from "react";

export default function ProductModal({ open, mode, initialProduct, onClose, onSubmit }) {
    const [titleValue, setTitleValue] = useState("");
    const [categoryValue, setCategoryValue] = useState("");
    const [descriptionValue, setDescriptionValue] = useState("");
    const [priceValue, setPriceValue] = useState("");
    const [stockValue, setStockValue] = useState("");
    const [ratingValue, setRatingValue] = useState("");
    const [imageValue, setImageValue] = useState("");

    useEffect(() => {
        if (!open) return;

        setTitleValue(initialProduct?.title ?? "");
        setCategoryValue(initialProduct?.category ?? "");
        setDescriptionValue(initialProduct?.description ?? "");
        setPriceValue(initialProduct?.price != null ? String(initialProduct.price) : "");
        setStockValue(initialProduct?.stock != null ? String(initialProduct.stock) : "");
        setRatingValue(initialProduct?.rating != null ? String(initialProduct.rating) : "");
        setImageValue(initialProduct?.image ?? "");
    }, [open, initialProduct]);

    if (!open) return null;

    const modalTitle = mode === "edit" ? "Редактирование товара" : "Создание товара";

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmedTitle = titleValue.trim();
        const trimmedCategory = categoryValue.trim();
        const trimmedDescription = descriptionValue.trim();
        const trimmedImage = imageValue.trim();

        const parsedPrice = Number(priceValue);
        const parsedStock = Number(stockValue);
        const parsedRating = Number(ratingValue);

        if (!trimmedTitle) return alert("Введите название товара");
        if (!trimmedCategory) return alert("Введите категорию");
        if (!trimmedDescription) return alert("Введите описание");
        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) return alert("Введите корректную цену (>= 0)");
        if (!Number.isFinite(parsedStock) || parsedStock < 0) return alert("Введите корректное количество на складе (>= 0)");
        if (!Number.isFinite(parsedRating) || parsedRating < 0 || parsedRating > 5) return alert("Введите рейтинг (0–5)");
        if (!trimmedImage) return alert("Введите ссылку на фото");

        onSubmit({
            id: initialProduct?.id,
            title: trimmedTitle,
            category: trimmedCategory,
            description: trimmedDescription,
            price: parsedPrice,
            stock: parsedStock,
            rating: parsedRating,
            image: trimmedImage,
        });
    };

    return (
        <div className="backdrop" onMouseDown={onClose}>
            <div
                className="modal"
                onMouseDown={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="modal__header">
                    <div className="modal__title">{modalTitle}</div>
                    <button className="iconBtn" onClick={onClose} aria-label="Закрыть">
                        ✕
                    </button>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    <label className="label">
                        Название
                        <input
                            className="input"
                            value={titleValue}
                            onChange={(e) => setTitleValue(e.target.value)}
                            placeholder="Например, Игровая мышь"
                            autoFocus
                        />
                    </label>

                    <label className="label">
                        Категория
                        <input
                            className="input"
                            value={categoryValue}
                            onChange={(e) => setCategoryValue(e.target.value)}
                            placeholder="Например, Периферия"
                        />
                    </label>

                    <label className="label">
                        Описание
                        <input
                            className="input"
                            value={descriptionValue}
                            onChange={(e) => setDescriptionValue(e.target.value)}
                            placeholder="Коротко о товаре"
                        />
                    </label>

                    <label className="label">
                        Цена
                        <input
                            className="input"
                            value={priceValue}
                            onChange={(e) => setPriceValue(e.target.value)}
                            placeholder="Например, 2490"
                            inputMode="numeric"
                        />
                    </label>

                    <label className="label">
                        Количество на складе
                        <input
                            className="input"
                            value={stockValue}
                            onChange={(e) => setStockValue(e.target.value)}
                            placeholder="Например, 10"
                            inputMode="numeric"
                        />
                    </label>

                    <label className="label">
                        Рейтинг (0–5)
                        <input
                            className="input"
                            value={ratingValue}
                            onChange={(e) => setRatingValue(e.target.value)}
                            placeholder="Например, 4.5"
                            inputMode="decimal"
                        />
                    </label>

                    <label className="label">
                        Ссылка на фото
                        <input
                            className="input"
                            value={imageValue}
                            onChange={(e) => setImageValue(e.target.value)}
                            placeholder="https://..."
                        />
                    </label>

                    <div className="modal__footer">
                        <button type="button" className="btn" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="btn btn--primary">
                            {mode === "edit" ? "Сохранить" : "Создать"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}