import { Chat } from "../model/chat.schema.js";
import { Message } from "../model/message.schema.js";
import { Product } from "../model/product.schema.js";

export const createChat = async (req, res) => {
  try {
    const { receiverId, productId } = req.body;
    const senderId = req.user.id;

    if (senderId === receiverId) {
      return res.status(400).json({ message: "You cannot chat with yourself" });
    }

    // Check if a 1-to-1 chat already exists between these two users (ignoring previous product)
    let chat = await Chat.findOne({
      participants: { $size: 2, $all: [senderId, receiverId] },
    });

    if (chat) {
      // If the product context is different, create a "Product" message as a separator
      if (productId && chat.productId?.toString() !== productId) {
        const productMessage = new Message({
          chatId: chat._id,
          sender: senderId,
          messageType: "product",
          productId: productId,
        });
        await productMessage.save();
        chat.productId = productId;
        chat.lastMessage = productMessage._id;
        await chat.save();
      }
      
      chat = await Chat.findById(chat._id)
        .populate("participants", "userName")
        .populate("productId");
    } else {
      // Create new chat and its first "Product" message
      chat = new Chat({
        participants: [senderId, receiverId],
        productId: productId || null,
      });
      await chat.save();

      if (productId) {
        const productMessage = new Message({
          chatId: chat._id,
          sender: senderId,
          messageType: "product",
          productId: productId,
        });
        await productMessage.save();
        chat.lastMessage = productMessage._id;
        await chat.save();
      }

      chat = await Chat.findById(chat._id)
        .populate("participants", "userName")
        .populate("productId");
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await Chat.find({
      participants: { $in: [userId] },
    })
      .populate("participants", "userName")
      .populate("productId")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId })
      .populate("sender", "userName")
      .populate("productId")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateChatQuantity = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { quantity } = req.body;

    const chat = await Chat.findByIdAndUpdate(
      chatId,
      { quantity },
      { new: true }
    ).populate("productId").populate("participants", "userName");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
