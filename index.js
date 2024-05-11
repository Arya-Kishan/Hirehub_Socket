import express from "express"
import http from "http"
import cors from "cors"
import { Server } from "socket.io"
import dotenv from "dotenv"

dotenv.config({});

const app = express();
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["POST", "GET"]
    }
});


let userSocketMap = {};


io.on("connection", (socket) => {

    console.log("User Connected : ", socket.id);

    const userId = socket.handshake.query.userId
    if (userId !== undefined) {
        userSocketMap[userId] = socket.id;
    }

    io.emit("onlineUsers", Object.keys(userSocketMap))


    socket.on("sendMessage", (message) => {

        console.log(message);

        const receiverSocketId = userSocketMap[message.data.receiverId];

        console.log(receiverSocketId);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("receiveMessage", message.data);
        }

    })


    socket.on("disconnect", () => {
        console.log("USER DISCONNECTED");
        delete userSocketMap[userId];
        io.emit("onlineUsers", Object.keys(userSocketMap))

    })


});


app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
}))


app.get("/", (req, res) => {
    res.send("arya")
})

server.listen(8000, () => {
    console.log("SOCKET SERVER LISTENED AT " + process.env.PORT);
})