import express from "express";
import config from "./config.js";
import httpOrig from "http";
import { Server as Socket } from "socket.io";
import cookieParser from "cookie-parser";
import handlebars from "express-handlebars";
import indexRouter from "../routes/index.js";
import path from "path";
import socketFunction from "../public/js/main.js";
import swaggerUi from "swagger-ui-express";
import doc from "./swagger.json";
const __dirname = path.resolve();
const PORT = process.env.PORT || 8080;
const app = express();
export const http = httpOrig.createServer(app);
const io = new Socket(http, {
	pingTimeout: 30000,
});
socketFunction(io);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use("/", indexRouter);
app.engine(
	"hbs",
	handlebars({
		extname: ".hbs",
		defaultLayout: "index.hbs",
	})
);
app.set("view engine", "hbs");
app.set("views", "./views");
app.use("/doc", swaggerUi.serve, swaggerUi.setup(doc));

app.get("/", (req, res) => {
	res.render("chat");
});
export default app;
