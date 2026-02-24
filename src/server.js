import express from 'express'
import cors from "cors"
import cookieParser from 'cookie-parser';
import userRoutes from './router/user.routes.js';
import productRoutes from './router/product.routes.js';
import refreshPage from "./router/authRefreshToken.router.js"
import customersRouter from "./router/customers.routes.js"
import ordersRouter from "./router/orders.router.js"
import Paymenverify from "./router/payment.router.js"
import profileRouter from './router/profile.router.js';
import path from "path"
import http from "http" // use for socket.io
import { Server } from 'socket.io'; // use for socket.io
const App = express();
App.use(cors({
    origin: process.env.API_FRONT_END,
    credentials: true
}))
App.use("/webhook/paystack", express.raw({ type: "application/json" }));
App.use(express.json());
App.use(cookieParser());
// all the image can get access to http://localhost:7000/public/upload/Product_img/imgName
App.use("/public/upload/Product_img/", express.static(path.join(process.cwd(), "public/upload/Product_img/")))
const server = async () => {
    try {
        App.use('/users', userRoutes)
        App.use("/product", productRoutes)
        App.use('/refresh', refreshPage)
        App.use("/customers", customersRouter)
        App.use("/check-out", ordersRouter)
        App.use("/orders", ordersRouter)
        App.use("/payment/", Paymenverify)
        App.use("/profile", profileRouter)
        App.use("/webhook/", express.raw({ type: "application/json" }), Paymenverify)
        //  before socket.io I was using this 
        { /* App.listen(process.env.PORT || 7000, () => {
            console.log(`server is running on http://localhost:${process.env.PORT}`)
        }) */}
        //  ---------------------------
        // socket begin here -------------------
        const httpServer = http.createServer(App);

        const io = new Server(httpServer, {
            cors: {
                origin: process.env.API_FRONT_END,
                credentials: true,
                methods: ["GET", "POST",]
            }
        });
        //  connection begin here 
        io.on("connection", (socket) => {
            console.log("Socket connected:", socket.id);

            socket.on("joinUser", (userId) => {
                const room = `user:${userId}`;
                socket.join(room);
                console.log("👤 User joined room:", room);
            });

            socket.on("joinAdmin", () => {
                socket.join("admins");
                console.log("👑 Admin joined");
            });

            socket.on("disconnect", () => {
                console.log("Socket disconnected:", socket.id);
            });
        });

        httpServer.listen(process.env.PORT || 7000, () => {
            console.log("Server running on port 7000");
        });
    } catch (error) {
        console.log("SERVER FAILLED !!!")
    }

}
server();
