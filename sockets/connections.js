const jwt = require("jsonwebtoken");
const app = require("../app");
const { authCheck } = require("../middlewares/authCheck");
const UserModel = require("../Models/UserModel");
const { getCorsOrigin } = require("../utils/helpers");
const messages = require("../Models/messages");
const { validateSocketData, chatSchema } = require("../middlewares/validateRequest");
const chats = require("../Models/chats");
const { SocketResponse } = require("../services/responseService");
const socketConnections = require("../Models/socketConnections");

const server = require("http").Server(app);

const io = require("socket.io")(server, {
  cors: {
    // origin: "http://localhost:3001",
    origin: getCorsOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const { JWT_SECRET_KEY } = process.env;

const handleSockets = async () => {
  io.use(async function (socket, next) {
    if (socket.handshake.auth && socket.handshake.auth.token) {
      const { token, userId } = socket.handshake.auth;
      if (!token || !userId) return next(new Error("Token and userId is required"));

      let user = {};
      try {
        jwt.verify(token, JWT_SECRET_KEY, (error, decoded) => {
          if (error || userId !== decoded?._id) {
            return next(new Error("Invalid token"));
          }
          user = decoded;
        });
      } catch (err) {
        console.log(err);
        return next(new Error("Authentication error"));
      }

      const existingUser = await UserModel.findOne(
        { _id: user._id },
        "status accessToken avatar email"
      ).lean();

      if (!existingUser) return next(new Error("Authentication error"));
      if (existingUser && existingUser.status === "inactive")
        return next(new Error("Please verify your email!!"));
      if (existingUser && existingUser.status === "blocked")
        return next(new Error("User is blocked"));
      if (!existingUser.accessToken?.includes(token)) return next(new Error("Unautorized"));

      socket.userId = socket.handshake.auth.userId;
      next();
    } else {
      next(new Error("Authentication error"));
    }
  }).on("connection", async (socket) => {
    try {
      console.log(`Socket ${socket.id} connected`);

      // Save user connection
      const isConnectionExist = await socketConnections.exists({ user: socket.userId });
      if (isConnectionExist) {
        const result = socketConnections.updateOne(
          { user: socket.userId },
          { socketId: socket.id }
        );
      } else {
        const newConnection = new socketConnections({ user: socket.userId, socketId: socket.id });
        const result = newConnection.save();
      }

      // notify when someone come online
      socket.broadcast.emit("user connected", socket.userId);

      //join user into the socket
      socket.on("client", ({ userId }, cb) => {
        if (!userId) return cb ? cb({ status: "failed", message: "userId is required" }) : ""; // create a common service for socket error msg and success msg just like apis

        console.log("client connected", userId);
        socket.join(userId);
        return cb ? cb({ status: "success", message: "User joined" }) : "";
      });

      // create chat and join users to the chat
      socket.on("joinChat", async ({ senderId, receiverId }, cb) => {
        console.log(senderId, " joined chat", receiverId);
        if (!senderId || !receiverId)
          return SocketResponse.failed(cb, "receiverId and senderId is required");

        const isChatExists = await chats.exists({ users: { $all: [senderId, receiverId] } });

        if (isChatExists) {
          socket.join(isChatExists._id);
          return SocketResponse.success(cb, "Chat joined successfully", {
            chatId: isChatExists._id,
          });
        } else {
          const newChat = new chats({ users: [senderId, receiverId] });
          const result = await newChat.save();
          socket.join(result._id);
          return SocketResponse.success(cb, "Chat created successfully", {
            chatId: result._id,
          });
        }
      });

      // send message
      socket.on(
        "sendMessage",
        // validateSocketData(chatSchema.messageSchema),
        async ({ message, chatId, sender, receiver }, cb) => {
          try {
            const newMessage = new messages({
              chat: chatId,
              sender,
              receiver,
              message,
            });
            const result = await newMessage.save();

            console.log("new message", message);

            socket.in(receiver).emit("newMessage", result);
            return SocketResponse.success(cb, "Message sent successfully");
          } catch (error) {
            return SocketResponse.failed(
              cb,
              error.message || error?.toString() || "Something went wrong"
            );
          }
        }
      );

      socket.on("disconnect", async () => {
        console.log(`Socket ${socket.id} disconnected`, socket.handshake.auth);

        socket.leave(socket.userId);
        // notify when someone goes offline
        socket.broadcast.emit("user disconnected", socket.userId);
        const result = await socketConnections.deleteOne({ user: socket.userId });
      });

      socket.on("connect_error", async (err) => {
        console.log("socket connection error", err);
      });
    } catch (error) {
      console.log("error", error);
    }
  });
};

module.exports = { handleSockets, server };
