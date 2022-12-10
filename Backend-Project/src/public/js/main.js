import {
	CarritoModel,
	ProductoModel,
	OrdenModel,
	MensajeModel,
} from "../../models/model.js";
import UserModel from "../../models/user.js";


let orden;
let carrito;
let productos;
let userId;
let userIdOK;


const checkUserId = async (idInformado) => {
	try {
		let userIdOK = await UserModel.find({ _id: idInformado }).lean();
		if (userIdOK) {
			return true;
		}
	} catch (error) {
		return false;
	}
};

const getOrder = async () => {
	try {
		orden = await OrdenModel.findOne().sort({ createdAt: -1 }).lean();
		return orden;
	} catch (error) {
		return "Error";
	}
};

const getCart = async (userId) => {

	try {
		carrito = await CarritoModel.find({ userId: userId }).lean();
	
		return carrito;
	} catch (error) {
		console.log("Error en GetCart");
		return "Error";
	}
};

const getStock = async () => {

	try {
		productos = await ProductoModel.find({}).lean();
	
		return productos;
	} catch (error) {
		console.log("Error en GetCart");
		return "Error";
	}
};

const createMessageUsuario = async (message) => {
	const mensageNueva = new MensajeModel({
		userId: userId,
		tipo: "Usuario",
		mensaje: message,
	});
	const creado = await mensageNueva.save();
};
const msgStandard = [
	'Ahora tu UserID está OK, pero no he podido comprender tu mensaje. Por favor ingresa una de las siguientes opciones ****"Stock"**** : Para conocer nuestro stock actual \n ****"Orden"****: Para conocer la información de tu ultima orden ****"Carrito"****: Para conocer el estado actual de tu carrito',
];

function socketFunction(io) {
	io.on("connection", (socket) => {
		console.log("a user connected");
		socket.on("userid", async (message) => {
			userId = message;
			console.log("UserId do cliente", userId);
			userIdOK = await checkUserId(userId);
			console.log("userIdOK", userIdOK);
		});
		socket.on("token", (message) => {
			tokenInformado = message;
			console.log("token do cliente", tokenInformado);
		});
		socket.on("new-message", async (message) => {
			console.log("Mensaje: ", message);
			message = JSON.stringify(message).toLowerCase();
			await createMessageUsuario(message);

			if (!userIdOK) {
				console.log("UserId incorrecto: ", userId);
				socket.emit(
					"resp-message",
					`UserId incorrecto, favor informarlo correctamente para continuar.`
				);
				return;
			}
		
			if (message.includes("carrito")) {
				await getCart(userId);
				
				socket.emit(
					"resp-message",
					`Carrito encontrado :   ${JSON.stringify(carrito)}`
				);
				return;
			} else if (message.includes("orden")) {
				await getOrder();
				
				socket.emit(
					"resp-message",
					`Última orden encontrada :   ${JSON.stringify(orden)}`
				);
				return;
			} else if (message.includes("stock")) {
				await getStock();
				
				socket.emit(
					"resp-message",
					`Vea el estoque de productos :   ${JSON.stringify(productos)}`
				);
				return;
			}
			
			socket.emit("resp-message", msgStandard);
		});
	});
}
export default socketFunction;
