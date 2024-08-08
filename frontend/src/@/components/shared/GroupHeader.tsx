import { useEffect, useState } from "react";
import useConversation from "../../../hooks/useConversation";
import MenuPopover from "./MenuPopover";
import MobileSidebar from "./MobileSidebar";
import UserAvatar from "./UserAvatart";
import { useSocketContext } from "../providers/SocketProvider";
import { cn } from "../../lib/utils";
import { useGroupInfoHook } from "../../../hooks/useSidebarHook";
import { Button } from "../ui/button";
import { IoMdInformationCircleOutline } from "react-icons/io";

export default function GroupHeader({ isAdmin }: { isAdmin: boolean }) {
  const { onOpen } = useGroupInfoHook();
  const { selectedConversation } = useConversation();
  const { socket } = useSocketContext();
  const [isTyping, setIsTyping] = useState({
    isTyping: false,
    senderName: "",
  });

  useEffect(() => {
    socket?.on("groupTyping", ({ groupId, senderName }) => {
      if (selectedConversation?.id === groupId) {
        setIsTyping({
          isTyping: true,
          senderName: senderName,
        });
      }
    });

    socket?.on("stopGroupTyping", ({ groupId, senderName }) => {
      if (selectedConversation?.id === groupId) {
        setIsTyping({
          isTyping: false,
          senderName: senderName,
        });
      }
    });

    return () => {
      socket?.off("groupTyping");
      socket?.off("stopGroupTyping");
    };
  }, [isTyping, socket, selectedConversation?.id]);

  return (
    <header className="p-2 w-full h-16  flex items-center   gap-2  bg-gradient-to-r from-sky-50 to-indigo-200 shadow-lg">
      <div className="block lg:hidden ">
        <MobileSidebar />
      </div>
      <div className="flex items-center px-2 w-full justify-between   gap-2">
        <div className="flex items-center   gap-x-2 ">
          <UserAvatar type={"group"} name={selectedConversation?.name} />

          <div className="flex flex-col items-start w-full justify-center ">
            <p className="text-lg md:text-xl font-sans  font-semibold ">
              {selectedConversation?.name}
            </p>
            <div
              className={cn(
                "flex items-center  w-full transition-all duration-1000 ease-in-out  opacity-0",
                isTyping.isTyping && "opacity-100 animate-pulse"
              )}
            >
              <span className="text-[10px] p-0 ">
                {isTyping.senderName} is typing...
              </span>
            </div>
          </div>
        </div>
        <div className="space-x-3">
          <MenuPopover type="group" />
          <Button
            variant={"destructive"}
            size={"icon2"}
            className="rounded-full"
            onClick={() => onOpen()}
          >
            <IoMdInformationCircleOutline size={20} />
          </Button>
        </div>
      </div>
    </header>
  );
}
