import { useQuery } from "@tanstack/react-query";
import { GroupMessageT, User } from "../../../types/type";
import { formatMessageDate } from "../../../utils/date";
import { IoCheckmarkDoneOutline, IoCheckmarkDoneSharp } from "react-icons/io5";
import { cn } from "../../lib/utils";

type props = {
  message: GroupMessageT;
};
const GroupMessageCard = ({ message }: props) => {
  const { data: authUser } = useQuery<User>({ queryKey: ["authUser"] });

  const fromMe = message?.senderId === authUser?.id;
  const img = fromMe ? authUser?.profilePic : message.sender.profilePic;
  const chatClass = fromMe ? "justify-end" : "justify-start";
  const bubbleClass = fromMe
    ? "bg-blue-500/90 text-white rounded-tr-none "
    : "bg-gray-200 text-black rounded-tl-none";
  return (
    <div className={`flex ${chatClass} mb-4 sidebar-animation`}>
      {!fromMe && (
        <div className=" w-6 h-6 sm:w-10 sm:h-10 rounded-full mr-2">
          <img alt="User Profile" src={img} className="rounded-full" />
        </div>
      )}
      <div>
        <p
          className={cn(
            "text-xs text-muted-foreground",
            fromMe ? "text-right" : "text-left"
          )}
        >
          {message.sender.fullname}
        </p>
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
      </div>
      {fromMe && (
        <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full ml-2">
          <img alt="User Profile" src={img} className="rounded-full" />
        </div>
      )}
    </div>
  );
};

export default GroupMessageCard;
