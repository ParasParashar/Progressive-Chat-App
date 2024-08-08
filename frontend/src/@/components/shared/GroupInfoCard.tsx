import { FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSocketContext } from "../providers/SocketProvider";
import { cn } from "../../lib/utils";
import GroupPopover from "./GroupPopover";
import useConversation from "../../../hooks/useConversation";
import { useGroupInfoHook } from "../../../hooks/useSidebarHook";

type props = {
  userId: string;
  username: string;
  fullname: string;
  profilePic: string;
  isAdmin: boolean;
  isMe: boolean;
  isUserAdmin?: boolean;
  groupMemberId: string;
  groupId: string;
};
const GroupInfoCard = ({
  userId,
  username,
  fullname,
  profilePic,
  isAdmin,
  groupMemberId,
  groupId,
  isMe,
  isUserAdmin,
}: props) => {
  const { setSelectedConversation } = useConversation();
  const { onClose } = useGroupInfoHook();
  const navigate = useNavigate();
  const handleClick = () => {
    if (isMe) return;
    setSelectedConversation({ id: userId, fullname, profilePic, type: "user" });
    navigate(`/messages/${userId}`);
    onClose();
  };
  const { onlineUsers } = useSocketContext();
  const isOnline = onlineUsers?.includes(userId);

  return (
    <section
      className={cn(
        "flex cursor-pointer  bg-indigo-50/25    group   items-center gap-1 border-slate-300 p-1  shadow-sm  justify-between hover:bg-indigo-50/70 rounded-sm"
        // isActive && " bg-white "
      )}
    >
      <div className="flex gap-1 w-full" onClick={handleClick}>
        <div className="relative object-cover rounded-full w-12 h-12 ">
          <img
            src={profilePic}
            alt="User Image"
            className="w-full h-full object-contain"
          />
          {isOnline && (
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-indigo-500"></span>
          )}
        </div>
        <div className="flex flex-col p-1 w-full">
          <div
            className={cn(
              "text-sm font-semibold text-muted-foreground group-hover:font-bold flex justify-between items-center w-full"
              //   isActive && "font-semibold"
            )}
          >
            <p>{fullname}</p>
            <div className=" flex  items-center gap-x-2">
              {isAdmin && (
                <div className=" flex  justify-center gap-[2px]">
                  <FaUser className="text-blue-500" size={12} />
                  <span className="text-blue-500 font-mono leading-none  text-xs">
                    Admin
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-muted-foreground ">
            <p
              className={cn(
                "text-sm font-thin  group-hover:font-normal line-clamp-1 truncate"
                //   isActive && "font-normal"
              )}
            >
              @{username}
            </p>
            {isMe && "you"}
          </div>
        </div>
      </div>
      {!isAdmin && isUserAdmin && (
        <GroupPopover
          groupId={groupId}
          userId={userId}
          groupMemberId={groupMemberId}
        />
      )}
    </section>
  );
};

export default GroupInfoCard;
