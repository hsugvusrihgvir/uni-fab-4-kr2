const express = require("express");
const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");

// Подключаем Swagger
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
const port = 3000;

const cors = require("cors");

app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// данные
let products = [
    {
        id: nanoid(6),
        title: "Товар 1",
        category: "Категория 1",
        description: "Описание",
        price: 2490,
        stock: 15,
        rating: 4.5,
        image: "https://avatars.mds.yandex.net/i?id=6cefae59a2b2d652cedc541df52559d07b8d7776-8878159-images-thumbs&n=13"
    },
    {
        id: nanoid(6),
        title: "Товар 2",
        category: "Категория 1",
        description: "Описание",
        price: 4590,
        stock: 8,
        rating: 4.7,
        image: "https://i.pinimg.com/736x/e6/56/4b/e6564bb16e340c8ad4b4c66aeefb377b.jpg"
    },
    {
        id: nanoid(6),
        title: "Товар 3",
        category: "Категория 2",
        description: "Описание",
        price: 21990,
        stock: 5,
        rating: 4.8,
        image: "https://i.pinimg.com/originals/e2/46/04/e246049d83c799b78a0ef20345f3d34c.gif"
    },
    {
        id: nanoid(6),
        title: "Товар 4",
        category: "Категория 1",
        description: "Описание",
        price: 5990,
        stock: 12,
        rating: 4.4,
        image: "https://i.pinimg.com/originals/44/fa/3d/44fa3d07d63b2a13b2ac71d3b32c3f00.gif"
    },
    {
        id: nanoid(6),
        title: "Товар 5",
        category: "Категория 3",
        description: "Описание",
        price: 7990,
        stock: 10,
        rating: 4.9,
        image: "https://i.pinimg.com/originals/02/a0/b1/02a0b1198723627ee296755e5efdd14d.gif"
    },
    {
        id: nanoid(6),
        title: "Товар 6",
        category: "Категория 1",
        description: "Описание",
        price: 3890,
        stock: 6,
        rating: 4.2,
        image: "https://i.pinimg.com/originals/46/bf/80/46bf808e8c364ea6dd0f145e6b18a7c5.gif"
    },
    {
        id: nanoid(6),
        title: "Товар 7",
        category: "Категория 2",
        description: "Описание",
        price: 3290,
        stock: 20,
        rating: 4.1,
        image: "https://i.pinimg.com/1200x/f4/fd/c0/f4fdc0b2e32726946972445907c058c5.jpg"
    },
    {
        id: nanoid(6),
        title: "Товар 8",
        category: "Категория 1",
        description: "Описание",
        price: 2690,
        stock: 14,
        rating: 4.0,
        image: "https://i.pinimg.com/736x/7c/d5/ad/7cd5ada33bb9569b83b0512013c6d066.jpg"
    },
    {
        id: nanoid(6),
        title: "Товар 9",
        category: "Категория 3",
        description: "Описание",
        price: 4990,
        stock: 9,
        rating: 4.6,
        image: "https://i.pinimg.com/736x/93/3c/c1/933cc1e2aedbeec55df30b43eeeef043.jpg"
    },
    {
        id: nanoid(6),
        title: "Товар 10",
        category: "Категория 2",
        description: "Описание",
        price: 1190,
        stock: 30,
        rating: 4.3,
        image: "https://i.pinimg.com/736x/2e/a8/32/2ea83212b7e44b3b398a5166c8a20c0f.jpg"
    }
];

let users = [];


const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API интернет магазина",
            version: "1.0.0",
            description: "Простое API для интернет магазина",
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: "Локальный сервер",
            },
        ],
    },
    apis: ["./app.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Операции с товарами
 *   - name: Auth
 *     description: Операции с пользователями
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - description
 *         - price
 *         - stock
 *       properties:
 *         id:
 *           type: string
 *           description: Автоматически сгенерированный уникальный ID товара
 *         title:
 *           type: string
 *           description: Название товара
 *         category:
 *           type: string
 *           description: Категория товара
 *         description:
 *           type: string
 *           description: Описание товара
 *         price:
 *           type: number
 *           description: Цена товара
 *         stock:
 *           type: integer
 *           description: Количество товара на складе
 *         rating:
 *           type: number
 *           description: Рейтинг товара (0–5)
 *         image:
 *           type: string
 *           description: Ссылка на изображение товара
 *       example:
 *         id: "abc123"
 *         title: "Товар 1"
 *         category: "Категория 1"
 *         description: "Описание 1"
 *         price: 2490
 *         stock: 15
 *         rating: 4.5
 *         image: "https://i.pinimg.com/736x/2e/a8/32/2ea83212b7e44b3b398a5166c8a20c0f.jpg"
 *
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *       example:
 *         id: "ab12cd"
 *         email: "ivan@example.com"
 *         first_name: "Иван"
 *         last_name: "Иванов"
 */


app.use(express.json());
app.use((req, res, next) => {
    res.on("finish", () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
            console.log("Body:", req.body);
        }
    });
    next();
});


function findProductOr404(id, res) {
    const product = products.find(p => p.id == id);
    if (!product) {
        res.status(404).json({ error: "Product not found" });
        return null;
    }
    return product;
}

function findUserByEmailOr404(email, res) {
    const user = users.find(u => u.email === email);
    if (!user) {
        res.status(404).json({ error: "user not found" });
        return null;
    }
    return user;
}

async function hashPassword(password) {
    const rounds = 10;
    return bcrypt.hash(password, rounds);
}

async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создаёт новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, category, description, price, stock]
 *             properties:
 *               title: { type: string }
 *               category: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               rating: { type: number }
 *               image: { type: string }
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
app.post("/api/products", (req, res) => {
    const { title, category, description, price, stock, rating, image } = req.body;

    const newProduct = {
        id: nanoid(6),
        title: title?.trim(),
        category: category?.trim(),
        description: description?.trim(),
        price: Number(price),
        stock: Number(stock),
        rating: Number(rating),
        image: image?.trim()
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Возвращает список всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get("/api/products", (req, res) => {
    res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получает товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Данные товара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
app.get("/api/products/:id", (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;
    res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновляет параметры товара
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, category, description, price, stock]
 *             properties:
 *               title: { type: string }
 *               category: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               rating: { type: number }
 *               image: { type: string }
 *     responses:
 *       200:
 *         description: Обновлённый товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
app.put("/api/products/:id", (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;

    const { title, category, description, price, stock, rating, image } = req.body;

    product.title = title?.trim();
    product.category = category?.trim();
    product.description = description?.trim();
    product.price = Number(price);
    product.stock = Number(stock);
    product.rating = Number(rating);
    product.image = image?.trim();

    res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удаляет товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema: { type: string }
 *         required: true
 *         description: ID товара
 *     responses:
 *       204:
 *         description: Товар успешно удалён (нет тела ответа)
 *       404:
 *         description: Товар не найден
 */
app.delete("/api/products/:id", (req, res) => {
    const id = req.params.id;
    const exists = products.some(p => p.id === id);
    if (!exists) return res.status(404).json({ error: "Product not found" });

    products = products.filter(p => p.id !== id);
    res.status(204).send();
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
 *     description: Создает нового пользователя с хешированным паролем
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - first_name
 *               - last_name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: ivan@example.com
 *               first_name:
 *                 type: string
 *                 example: Иван
 *               last_name:
 *                 type: string
 *                 example: Иванов
 *               password:
 *                 type: string
 *                 example: qwerty123
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Некорректные данные
 */

app.post("/api/auth/register", async (req, res) => {
    const { email, first_name, last_name, password } = req.body;

    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ error: "email, first_name, last_name and password are required" });
    }

    const newUser = {
        id: nanoid(6),
        email: email.trim(),
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        hashedPassword: await hashPassword(password)
    };

    users.push(newUser);

    res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name
    });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Авторизация пользователя
 *     description: Проверяет email и пароль пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: ivan@example.com
 *               password:
 *                 type: string
 *                 example: qwerty123
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 login:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Отсутствуют обязательные поля
 *       401:
 *         description: Неверные учетные данные
 *       404:
 *         description: Пользователь не найден
 */

app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "email and password are required" });
    }

    const user = findUserByEmailOr404(email, res);
    if (!user) return;

    const isAuthenticated = await verifyPassword(password, user.hashedPassword);

    if (isAuthenticated) {
        res.status(200).json({ login: true });
    } else {
        res.status(401).json({ error: "not authenticated" });
    }
});

app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(`Swagger UI доступен по адресу http://localhost:${port}/api-docs`);
});