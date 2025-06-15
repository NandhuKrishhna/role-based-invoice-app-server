import "reflect-metadata";
import "./Infrastructure/di/container";
import "dotenv/config";
import express from "express";
import cors from "cors";
import { APP_ORIGIN, PORT } from "./Shared/constants/env";
import { CORS_ALLOWED_HEADERS, CORS_METHODS } from "./Shared/constants/cors";
import errorHandler from "./Presentation/middlewares/errorHandler";
import connectToDatabase from "./Infrastructure/Database/connectToDatabase";
import authRouter from "./Presentation/routes/authroutes";
import authenticate from "./Presentation/middlewares/authMiddleware";
import superAdminRoutes from "./Presentation/routes/superAdminRoutes";
import Role from "./Shared/constants/roles";
import authorizeRoles from "./Presentation/middlewares/roleBaseAuthentication";
import cookieParser from "cookie-parser";
import adminRouter from "./Presentation/routes/adminRoutes";
import unitManagerRouter from "./Presentation/routes/unitManagerRouter";
import userRouter from "./Presentation/routes/userRoutes";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
    origin: APP_ORIGIN,
    credentials: true,
    methods: CORS_METHODS,
    allowedHeaders: CORS_ALLOWED_HEADERS,
}
app.use(cors(corsOptions));
app.get("/", (req, res) => {
    res.send("Welcome to the Wavenet Solutions API");
});
app.use("/api", authRouter);
app.use("/api/super-admin", authenticate, authorizeRoles([Role.SUPER_ADMIN]), superAdminRoutes);
app.use("/api/admin", authenticate, authorizeRoles([Role.ADMIN, Role.UNIT_MANAGER]), adminRouter);
app.use("/api/unit-manager", authenticate, authorizeRoles([Role.UNIT_MANAGER]), unitManagerRouter);
app.use("/api/user", authenticate, authorizeRoles([Role.USER]), userRouter);

app.use(errorHandler);

const startServer = async () => {
    await connectToDatabase();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
}

startServer()
