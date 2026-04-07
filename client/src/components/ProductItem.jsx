// src/pages/UsersPage/ProductItem.jsx
import React from "react";

export default function ProductItem({ product, onEdit, onDelete }) {
    const {
        id,
        title,
        category,
        description,
        price,
        stock,
        rating,
        image,
    } = product;

    return (
        <article className="productRow">
            <div className="productMedia">
                <img
                    className="productImage"
                    src={image}
                    alt={title}
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.src = "https://i.pinimg.com/736x/7c/55/25/7c5525900264f7d11fe61c1630047fe0.jpg";
                    }}
                />
            </div>

            <div className="productBody">
                <div className="productMain">
                    <div className="productTopLine">
                        <span className="productId">#{id}</span>
                        <h3 className="productTitle">{title}</h3>
                    </div>

                    <div className="productBadges">
                        <span className="productCategory">{category}</span>
                        <span className="productPrice">{price} ₽</span>
                    </div>

                    <p className="productDesc">{description}</p>

                    <div className="productStats">
                        <span className="productStock">В наличии: {stock}</span>
                        <span className="productRating">Рейтинг: {rating}</span>
                    </div>
                </div>
            </div>

            <div className="productActions">
                <button className="btn" onClick={() => onEdit(product)}>
                    Редактировать
                </button>
                <button className="btn btn--danger" onClick={() => onDelete(id)}>
                    Удалить
                </button>
            </div>
        </article>
    );
}