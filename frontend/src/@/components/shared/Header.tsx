import { Link } from "react-router-dom";
import useConversation from "../../../hooks/useConversation";
import MobileSidebar from "./MobileSidebar";
import MenuPopover from "./MenuPopover";
import { useSocketContext } from "../providers/SocketProvider";
import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import VideoCallButton from "../videoCall/VideoCallButton";
type headerProps = {
  type: "message" | "home";
};

const Header = ({ type }: headerProps) => {
  const { selectedConversation } = useConversation();
  const { onlineUsers, socket } = useSocketContext();
  const isOnline = onlineUsers.includes(selectedConversation?.id as string);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    socket?.on("typing", ({ senderId }) => {
      if (selectedConversation?.id === senderId) {
        setIsTyping(true);
      }
    });

    socket?.on("stopTyping", ({ senderId }) => {
      if (selectedConversation?.id === senderId) {
        setIsTyping(false);
      }
    });

    return () => {
      socket?.off("typing");
      socket?.off("stopTyping");
    };
  }, [selectedConversation?.id, socket, type, isOnline]);

  return (
    <header className="p-2 w-full h-16  flex items-center   gap-2  bg-gradient-to-r from-sky-50 to-indigo-200 shadow-lg">
      <div className="block lg:hidden ">
        <MobileSidebar />
      </div>
      {type === "message" ? (
        <div className="flex items-center px-2 w-full justify-between   gap-2">
          <div className="flex items-center   gap-x-2 ">
            <div className="relative  object-fill ">
              <img
                src={selectedConversation?.profilePic}
                alt="User Image"
                className="  rounded-full object-contain  size-12"
              />
              {isOnline && (
                <span className="absolute rounded-full p-1 top-1   right-1 text-blue-500 bg-blue-500" />
              )}
            </div>
            <div className="flex flex-col items-start w-full justify-center ">
              <p className="text-lg md:text-xl font-sans  font-semibold ">
                {selectedConversation?.fullname}
              </p>
              <div
                className={cn(
                  "flex items-center w-full transition-all duration-1000 ease-in-out  opacity-0",
                  isTyping && "opacity-100 animate-pulse"
                )}
              >
                <span className="text-[10px] p-0 ">Typing...</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-x-3">
            <VideoCallButton />
            <MenuPopover type="chat" />
          </div>
        </div>
      ) : (
        <Link to={"/"}>
          <h5 className="text-xl text-center font-serif  font-bold">
            Chat-app
          </h5>
        </Link>
      )}
    </header>
  );
};

export default Header;
