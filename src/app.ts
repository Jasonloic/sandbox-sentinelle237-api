import express from "express";
import type { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { connectToDB } from "./config/db";
import { AppRoutes } from "./routes/AppRoutes";
import ErrorHandler from "./middlewares/ErrorHandler";
import { HttpException } from "./utils/HttpExceptions";

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", AppRoutes);

app.use((_req: Request, _res: Response, next: NextFunction) => {
    next(new HttpException(404, "Route not found"));
});

app.use(ErrorHandler);

const initializeApp = async () => {
    try {
        app.listen(3000, () => {
            console.log(`[server]: server is running at http://localhost:3000/api`);
        });
        await connectToDB();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

initializeApp();