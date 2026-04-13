const express = require("express");
const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const cors = require("cors");

const app = express();
const port = 3000;

const jwt = require("jsonwebtoken");

const JWT_SECRET = "alnz4Rwm6NSW";
const ACCESS_EXPIRES_IN = "15m";

const REFRESH_SECRET = "refresh_secret_123";
const REFRESH_EXPIRES_IN = "7d";

app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-refresh-token"],
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
        role: "admin",
        is_blocked: false,
        hashedPassword: "$2b$10$wQOQH0J8v7G4apx0wq4AjueQJ8xUu8pR8vA2L4Hbo2C0u4B8kL4Ze"
    }
];

const refreshTokens = new Set();

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

// хеширование пароля
async function hashPassword(password) {
    const rounds = 10;
    return bcrypt.hash(password, rounds);
}

// валидация товара
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

function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role,
        },
        JWT_SECRET,
        {
            expiresIn: ACCESS_EXPIRES_IN,
        }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role,
        },
        REFRESH_SECRET,
        {
            expiresIn: REFRESH_EXPIRES_IN,
        }
    );
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

// логирование запросов
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

function roleMiddleware(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: "Forbidden",
            });
        }

        next();
    };
}

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Операции с товарами
 *   - name: Auth
 *     description: Операции с пользователями
 *   - name: Users
 *     description: Операции с пользователями для администратора
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
 *         role:
 *           type: string
 *           enum: [user, seller, admin]
 *         is_blocked:
 *           type: boolean
 *       example:
 *         id: "ab12cd"
 *         email: "ivan@example.com"
 *         first_name: "Иван"
 *         last_name: "Иванов"
 *         role: "user"
 *         is_blocked: false
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
 *     description: Создает нового пользователя с хешированным паролем. Роль всегда назначается как user
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
        const { email, first_name, last_name, password, role } = req.body;

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
            role: role && ["user", "seller", "admin"].includes(role) ? role : "user",
            is_blocked: false,
            hashedPassword: await hashPassword(normalizedPassword)
        };

        users.push(newUser);

        res.status(201).json({
            id: newUser.id,
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            role: newUser.role,
            is_blocked: newUser.is_blocked
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
 *                 refreshToken:
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
    if (!user || user.is_blocked) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    refreshTokens.add(refreshToken);

    res.json({
        accessToken,
        refreshToken,
    });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновляет пару access и refresh токенов
 *     description: Получает refresh-токен из заголовка x-refresh-token и возвращает новую пару токенов
 *     tags: [Auth]
 *     parameters:
 *       - in: header
 *         name: x-refresh-token
 *         schema:
 *           type: string
 *         required: true
 *         description: Refresh token
 *     responses:
 *       200:
 *         description: Новая пара токенов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Refresh token не передан
 *       401:
 *         description: Refresh token невалиден или истёк
 */
app.post("/api/auth/refresh", (req, res) => {
    const refreshToken = req.headers["x-refresh-token"];

    if (!refreshToken) {
        return res.status(400).json({
            error: "refreshToken is required",
        });
    }

    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({
            error: "Invalid refresh token",
        });
    }

    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        const user = users.find((u) => u.id === payload.sub);

        if (!user || user.is_blocked) {
            return res.status(401).json({
                error: "User not found",
            });
        }

        refreshTokens.delete(refreshToken);

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        refreshTokens.add(newRefreshToken);

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (err) {
        return res.status(401).json({
            error: "Invalid or expired refresh token",
        });
    }
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
        last_name: user.last_name,
        role: user.role,
        is_blocked: user.is_blocked
    });
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список пользователей
 *     description: Доступ только для администратора
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden
 */
app.get("/api/users", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
    res.json(
        users.map((u) => ({
            id: u.id,
            email: u.email,
            first_name: u.first_name,
            last_name: u.last_name,
            role: u.role,
            is_blocked: u.is_blocked
        }))
    );
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по id
 *     description: Доступ только для администратора
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Пользователь
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
app.get("/api/users/:id", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
    const user = users.find((u) => u.id === req.params.id);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_blocked: user.is_blocked
    });
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Обновить информацию пользователя
 *     description: Доступ только для администратора. Можно менять имя, фамилию и роль
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, seller, admin]
 *     responses:
 *       200:
 *         description: Пользователь обновлён
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
app.put("/api/users/:id", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
    const user = users.find((u) => u.id === req.params.id);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const { first_name, last_name, role } = req.body;

    if (first_name !== undefined) {
        user.first_name = String(first_name).trim();
    }

    if (last_name !== undefined) {
        user.last_name = String(last_name).trim();
    }

    if (role !== undefined) {
        if (!["user", "seller", "admin"].includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }
        user.role = role;
    }

    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_blocked: user.is_blocked
    });
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Заблокировать пользователя
 *     description: Доступ только для администратора
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Пользователь заблокирован
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
app.delete("/api/users/:id", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
    const user = users.find((u) => u.id === req.params.id);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    user.is_blocked = true;

    res.json({
        message: "User blocked",
        id: user.id
    });
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создаёт новый товар
 *     description: Доступ только для seller и admin
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
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
 *       403:
 *         description: Forbidden
 */
app.post("/api/products", authMiddleware, roleMiddleware(["seller", "admin"]), (req, res) => {
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
 *     description: Доступ для user, seller, admin
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       403:
 *         description: Forbidden
 */
app.get("/api/products", authMiddleware, roleMiddleware(["user", "seller", "admin"]), (req, res) => {
    res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получает товар по ID
 *     description: Доступ для user, seller, admin
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
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Товар не найден
 */
app.get("/api/products/:id", authMiddleware, roleMiddleware(["user", "seller", "admin"]), (req, res) => {
    const product = findProductOr404(req.params.id, res);
    if (!product) return;

    res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновляет параметры товара
 *     description: Доступ только для seller и admin
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
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Товар не найден
 */
app.put("/api/products/:id", authMiddleware, roleMiddleware(["seller", "admin"]), (req, res) => {
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
 *     description: Доступ только для admin
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
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Товар не найден
 */
app.delete("/api/products/:id", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
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