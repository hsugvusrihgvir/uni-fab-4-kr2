const express = require("express");
const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");

// Подключаем Swagger
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const cors = require("cors");

const app = express();
const port = 3000;

const jwt = require("jsonwebtoken");
const JWT_SECRET = "alnz4Rwm6NSW";
const ACCESS_EXPIRES_IN = "15m";

app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

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
    }
];

let users = [
    {
        id: nanoid(6),
        email: "admin@example.com",
        first_name: "Admin",
        last_name: "User",
        hashedPassword: "$2b$10$wQOQH0J8v7G4apx0wq4AjueQJ8xUu8pR8vA2L4Hbo2C0u4B8kL4Ze"
    }
];

// поиск товара по айди
function findProductOr404(id, res) {
    const product = products.find((p) => p.id === id);

    if (!product) {
        res.status(404).json({ error: "Product not found" });
        return null;
    }

    return product;
}

// поиск пользователя по почте
function findUserByEmailOr404(email, res) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
        res.status(404).json({ error: "user not found" });
        return null;
    }

    return user;
}

// Хеширование пароля
async function hashPassword(password) {
    const rounds = 10;
    return bcrypt.hash(password, rounds);
}

// Проверка пароля
async function verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
}

// Валидация товара
function validateProductPayload(body) {
    const { title, category, description, price } = body;

    if (!title || !category || !description || price === undefined) {
        return "title, category, description and price are required";
    }

    const normalizedTitle = String(title).trim();
    const normalizedCategory = String(category).trim();
    const normalizedDescription = String(description).trim();
    const normalizedPrice = Number(price);

    if (!normalizedTitle || !normalizedCategory || !normalizedDescription) {
        return "title, category and description must not be empty";
    }

    if (Number.isNaN(normalizedPrice) || normalizedPrice < 0) {
        return "price must be a non-negative number";
    }

    if (body.stock !== undefined) {
        const stock = Number(body.stock);
        if (Number.isNaN(stock) || stock < 0) {
            return "stock must be a non-negative number";
        }
    }

    if (body.rating !== undefined) {
        const rating = Number(body.rating);
        if (Number.isNaN(rating) || rating < 0 || rating > 5) {
            return "rating must be a number from 0 to 5";
        }
    }

    return null;
}

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

// Логирование запросов
app.use((req, res, next) => {
    res.on("finish", () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);

        if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
            console.log("Body:", req.body);
        }
    });

    next();
});

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            error: "Missing or invalid Authorization header",
        });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch {
        return res.status(401).json({
            error: "Invalid or expired token",
        });
    }
}

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
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - description
 *         - price
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
 *         image: "https://example.com/image.jpg"
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
    try {
        const { email, first_name, last_name, password } = req.body;

        if (!email || !first_name || !last_name || !password) {
            return res.status(400).json({ error: "email, first_name, last_name and password are required" });
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const normalizedFirstName = String(first_name).trim();
        const normalizedLastName = String(last_name).trim();
        const normalizedPassword = String(password);

        if (!normalizedEmail || !normalizedFirstName || !normalizedLastName || !normalizedPassword) {
            return res.status(400).json({ error: "fields must not be empty" });
        }

        const existingUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);
        if (existingUser) {
            return res.status(400).json({ error: "user with this email already exists" });
        }

        const newUser = {
            id: nanoid(6),
            email: normalizedEmail,
            first_name: normalizedFirstName,
            last_name: normalizedLastName,
            hashedPassword: await hashPassword(normalizedPassword)
        };

        users.push(newUser);

        res.status(201).json({
            id: newUser.id,
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Авторизация пользователя
 *     description: Проверяет логин и пароль пользователя
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
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
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

    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
        {
            sub: user.id,
            email: user.email,
        },
        JWT_SECRET,
        { expiresIn: ACCESS_EXPIRES_IN }
    );

    res.json({ accessToken });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Возвращает объект текущего пользователя
 *     description: Требует Bearer token в заголовке Authorization
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Текущий пользователь
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Токен отсутствует или невалиден
 *       404:
 *         description: Пользователь не найден
 */
app.get("/api/auth/me", authMiddleware, (req, res) => {
    const user = users.find(u => u.id === req.user.sub);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
    });
});

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
 *             required:
 *               - title
 *               - category
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               rating:
 *                 type: number
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Товар создан
 *       400:
 *         description: Некорректные данные
 */
app.post("/api/products", (req, res) => {
    const validationError = validateProductPayload(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const { title, category, description, price, stock, rating, image } = req.body;

    const newProduct = {
        id: nanoid(6),
        title: String(title).trim(),
        category: String(category).trim(),
        description: String(description).trim(),
        price: Number(price),
        stock: stock !== undefined ? Number(stock) : 0,
        rating: rating !== undefined ? Number(rating) : 0,
        image: image ? String(image).trim() : ""
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
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
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
app.get("/api/products/:id", authMiddleware, (req, res) => {
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
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - description
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               rating:
 *                 type: number
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Обновлённый товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Некорректные данные
 *       404:
 *         description: Товар не найден
 */
app.put("/api/products/:id", authMiddleware, (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;

    const validationError = validateProductPayload(req.body);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const { title, category, description, price, stock, rating, image } = req.body;

    product.title = String(title).trim();
    product.category = String(category).trim();
    product.description = String(description).trim();
    product.price = Number(price);
    product.stock = stock !== undefined ? Number(stock) : 0;
    product.rating = rating !== undefined ? Number(rating) : 0;
    product.image = image ? String(image).trim() : "";

    res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удаляет товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID товара
 *     responses:
 *       204:
 *         description: Товар успешно удалён
 *       404:
 *         description: Товар не найден
 */
app.delete("/api/products/:id", authMiddleware, (req, res) => {
    const id = req.params.id;
    const exists = products.some((p) => p.id === id);

    if (!exists) {
        return res.status(404).json({ error: "Product not found" });
    }

    products = products.filter((p) => p.id !== id);
    res.status(204).send();
});

// Обработка несуществующих маршрутов
app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

// Глобальная обработка ошибок
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error" });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
    console.log(`Swagger UI доступен по адресу http://localhost:${port}/api-docs`);
});