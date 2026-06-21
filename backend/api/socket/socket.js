import { Message } from "../model/message.schema.js";
import { Chat } from "../model/chat.schema.js";

export const setupSocket = (io) => {
  io.on("connection", (socket) => {

    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("send_message", async (data) => {

      const { chatId, sender, text } = data;

      if (!sender) {
        return;
      }

      try {
        const newMessage = new Message({
          chatId,
          sender,
          text,
        });

        await newMessage.save();

        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: newMessage._id,
        });

        const populatedMessage = await Message.findById(newMessage._id).populate("sender", "userName");

        // Normalize payload so client receives plain JSON with sender id as string
        const payload = populatedMessage.toObject ? populatedMessage.toObject() : { ...populatedMessage };
        if (payload.sender && payload.sender._id) {
          payload.sender = {
            _id: payload.sender._id.toString(),
            userName: payload.sender.userName,
          };
        } else if (payload.sender && typeof payload.sender === "string") {
          payload.sender = { _id: payload.sender };
        }

        // Send the message to other sockets in the room
        socket.to(chatId).emit("receive_message", payload);
        // Also send the message back to the sender to guarantee delivery
        socket.emit("receive_message", payload);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });
    socket.on("disconnect", () => {});
  });
};