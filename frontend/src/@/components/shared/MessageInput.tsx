import { BiSend } from "react-icons/bi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import React, { useEffect, useState } from "react";
import { useCreateMessage } from "../../../hooks/useCreateGetMessage";
import Emoji from "./Emoji";
import { useSocketContext } from "../providers/SocketProvider";
import { useQuery } from "@tanstack/react-query";
import { User } from "../../../types/type";
import { useParams } from "react-router-dom";

const MessageInput = () => {
  const { id } = useParams();
  const { data: authUser } = useQuery<User>({ queryKey: ["authUser"] });
  const { socket } = useSocketContext();
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState("");
  const { mutate, isPending } = useCreateMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() !== "") {
      mutate(message);
      setMessage("");
      socket?.emit("stopTyping", { senderId: authUser?.id, receiverId: id });
    }
  };
  const handleEmojiClick = (emojiObject: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      socket?.emit("typing", { senderId: authUser?.id, receiverId: id });
    }
    if (e.target.value === "") {
      setIsTyping(false);
      socket?.emit("stopTyping", { senderId: authUser?.id, receiverId: id });
    }
  };

  // debouncing socket event
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socket?.emit("stopTyping", { senderId: authUser?.id, receiverId: id });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [message, isTyping]);
  return (
    <form
      onSubmit={handleSubmit}
      className="w-full  flex items-center justify-center 
        border-sky-50 px-3 p-2 pb-1 gap-1 rounded-full
        bg-gradient-to-l from-sky-50 to-indigo-200 
        "
    >
      <Emoji onEmojiClick={handleEmojiClick} />
      <Input
        placeholder="Type your message"
        onChange={handleChange}
        value={message}
        className="text-xl w-full ring-0 focus-visible:ring-0   outline-none p-3   rounded-sm border-none"
        autoFocus
        required
      />
      <Button
        size={"icon"}
        disabled={isPending}
        variant={"ghost"}
        className="group"
      >
        <BiSend size={30} className="text-blue-500 group-hover:text-blue-400" />
      </Button>
    </form>
  );
};

export default MessageInput;
