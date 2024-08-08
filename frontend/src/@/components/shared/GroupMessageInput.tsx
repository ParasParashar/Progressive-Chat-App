import { BiSend } from "react-icons/bi";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Emoji from "./Emoji";
import { useEffect, useState } from "react";
import { useCreateGroupMessage } from "../../../hooks/useCreateGroupMessage";
import { useSocketContext } from "../providers/SocketProvider";
import { useQuery } from "@tanstack/react-query";
import { User } from "../../../types/type";
import { useParams } from "react-router-dom";

const GroupMessageInput = () => {
  const { id: groupId } = useParams();
  const [message, setMessage] = useState("");
  const { mutate, isPending } = useCreateGroupMessage();
  const [isTyping, setIsTyping] = useState(false);
  const { socket } = useSocketContext();
  const { data: authUser } = useQuery<User>({ queryKey: ["authUser"] });

  // emiting socket event
  useEffect(() => {
    const t = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socket?.emit("stopGroupTyping", {
          groupId: groupId,
          senderName: authUser?.fullname,
        });
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [message, isTyping]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      socket?.emit("groupTyping", {
        groupId: groupId,
        senderName: authUser?.fullname,
      });
    }
    if (e.target.value === "") {
      setIsTyping(false);
      socket?.emit("stopGroupTyping", {
        groupId: groupId,
        senderName: authUser?.fullname,
      });
    }
  };
  const handleEmojiClick = (emojiObject: any, e: React.MouseEvent) => {
    e.stopPropagation();
    socket?.emit("groupTyping", {
      groupId: groupId,
      senderName: authUser?.fullname,
    });
    setMessage((prevMessage: string) => prevMessage + emojiObject.emoji);
    socket?.emit("stopGroupTyping", {
      groupId: groupId,
      senderName: authUser?.fullname,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() !== "") {
      mutate(message);
      setMessage("");
      socket?.emit("stopGroupTyping", {
        groupId: groupId,
        senderName: authUser?.fullname,
      });
    }
  };

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

export default GroupMessageInput;
