import { useNavigate } from "react-router-dom";
import useConversation from "../../../hooks/useConversation";
import { SearchCardType } from "../../../types/type";
import { useSocketContext } from "../providers/SocketProvider";
import UserAvatar from "./UserAvatart";
import useSidebarHook from "../../../hooks/useSidebarHook";

export default function SearchCard({
  type,
  name,
  fullname,
  username,
  id,
  profilePic,
}: SearchCardType) {
  const { selectedConversation, setSelectedConversation } = useConversation();
  const isActive = id === selectedConversation?.id;
  const { onlineUsers } = useSocketContext();
  const isOnline = onlineUsers.includes(id);

  const { onClose } = useSidebarHook();
  const navigate = useNavigate();

  const handleClick = () => {
    if (type === "group") {
      setSelectedConversation({
        id: id,
        name: name,
        type: "group",
      });
      navigate(`/group/${id}`);
    } else {
      setSelectedConversation({
        id,
        fullname: fullname,
        profilePic,
        type: "user",
      });
      navigate(`/messages/${id}`);
    }
    onClose();
  };

  return (
    <section
      onClick={handleClick}
      className={`flex overflow-hidden cursor-pointer duration-200 px-4 py-2 justify-between items-center bg-gray-50 hover:bg-blue-100/60 transition-all ease-in-out w-full gap-2 sidebar-animation ${
        isActive ? "bg-sky-100   shadow-inner" : ""
      }`}
    >
      <div className="flex items-center justify-start w-full">
        <div className="relative object-cover rounded-full w-10 h-10 mr-4">
          <UserAvatar type={type} img={profilePic} name={name} />
          {isOnline && (
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-indigo-500"></span>
          )}
        </div>
        <div className="flex flex-col w-full line-clamp-1">
          <p className="text-md font-semibold text-gray-900">
            {fullname ? fullname : name}
          </p>
          <p className="text-sm text-gray-500 line-clamp-1 truncate">
            @{type === "user" ? username : "group"}
          </p>
        </div>
      </div>
    </section>
  );
}
