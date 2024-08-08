import { useQuery } from "@tanstack/react-query";
import { User, MessageType } from "../../../types/type";
import useConversation from "../../../hooks/useConversation";
import { IoCheckmarkDoneOutline, IoCheckmarkDoneSharp } from "react-icons/io5";
import { formatMessageDate } from "../../../utils/date";

type MessageProps = {
  message: MessageType;
};

const MessageCard = ({ message }: MessageProps) => {
  const { selectedConversation } = useConversation();
  const { data: authUser } = useQuery<User>({ queryKey: ["authUser"] });
  const fromMe = message?.senderId === authUser?.id;
  const img = fromMe ? authUser?.profilePic : selectedConversation?.profilePic;
  const chatClass = fromMe ? "justify-end" : "justify-start";
  const bubbleClass = fromMe
    ? "bg-blue-500/90 text-white rounded-br-none "
    : "bg-gray-200 text-black rounded-bl-none";
  return (
    <div className={`flex ${chatClass} mb-4 sidebar-animation`}>
      {!fromMe && (
        <div className=" w-6 h-6 sm:w-10 sm:h-10 rounded-full mr-2">
          <img alt="User Profile" src={img} className="rounded-full" />
        </div>
      )}
      <div
        className={`max-w-xs md:max-w-md p-3 min-w-10 rounded-3xl ${bubbleClass}`}
      >
        <p className="text-sm md:text-md mb-1 break-all break-words">
          {message.body}
        </p>
        <span className="opacity-50 text-[10px] flex gap-1 justify-between items-center">
          {formatMessageDate(message.createdAt)}
          {fromMe && message.seen ? (
            <IoCheckmarkDoneSharp size={20} className="text-black/70" />
          ) : (
            <IoCheckmarkDoneOutline size={20} className=" text-secondary" />
          )}
        </span>
      </div>
      {fromMe && (
        <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full ml-2">
          <img alt="User Profile" src={img} className="rounded-full" />
        </div>
      )}
    </div>
  );
};

export default MessageCard;
