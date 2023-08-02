import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import { notFoundError, errorHandler } from "./src/middleware/errorHandler";
import userRouter from "./src/routes/userRoutes";
import departmentRouter from "./src/routes/departmentRoutes";
import roleRouter from "./src/routes/roleRoutes";
import locationRouter from "./src/routes/locationRoutes";
import systemRouter from "./src/routes/systemRoutes";
import vehicleRouter from "./src/routes/vehicleRoutes";
import speciesRouter from "./src/routes/speciesRoutes";

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/roles", roleRouter);
app.use("/api/locations", locationRouter);
app.use("/api/systems", systemRouter);
app.use("/api/vehicles", vehicleRouter);
app.use("/api/species", speciesRouter);

app.use(notFoundError);
app.use(errorHandler);

app.listen(port, () => {
	console.log(`Server.ts listening on port ${port}.`);
});
