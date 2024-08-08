import SidebarItem from "./SidebarItem";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { UserSkeleton } from "../Loaders/UserSkeleton";
import {
  GroupMessageT,
  MessageType,
  SidebarData,
  User,
} from "../../../types/type";
import SearchModal from "./SearchModal";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useSocketContext } from "../providers/SocketProvider";
import SidebarFooter from "./SidebarFooter";
import CreateGroup from "./CreateGroup";

export default function Sidebar() {
  const { data: authUser } = useQuery<User>({ queryKey: ["authUser"] });
  const { socket } = useSocketContext();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      try {
        const { data } = await axios.get("/api/messages/conversations");
        if (data.error) {
          throw new Error(data.error);
        }
        return data;
      } catch (error: any) {
        throw new Error(error.message || "error in getting all the user");
      }
    },
  });

  useEffect(() => {
    socket?.on("new-message", (data: MessageType) => {
      queryClient.setQueryData(
        ["conversations"],
        (oldConversations: SidebarData[]) => {
          const updatedCon = oldConversations.map(
            (conversation: SidebarData) => {
              if (conversation.id === data.conversationId) {
                return {
                  ...conversation,
                  message: {
                    body: data.body,
                    conversationId: data.conversationId,
                    seen: data.seen,
                    createdAt: data.createdAt,
                  },
                  unseenMesssages:
                    authUser?.id === data.senderId
                      ? conversation.unseenMesssages
                      : conversation.unseenMesssages + 1,
                };
              }
              return conversation;
            }
          );
          if (
            !updatedCon.some(
              (conversation) => conversation.id === data.conversationId
            )
          ) {
            const senderSide = {
              id: data.receiver?.id as string,
              fullname: data.receiver?.fullname as string,
              profilePic: data.receiver?.profilePic as string,
              username: data.receiver?.username as string,
            };

            const receiverSide = {
              id: data.sender?.id as string,
              fullname: data.sender?.fullname as string,
              profilePic: data.sender?.profilePic as string,
              username: data.sender?.username as string,
            };

            updatedCon.push({
              id: data.conversationId as string,
              message: {
                body: data.body,
                conversationId: data.conversationId as string,
                seen: data.seen,
                createdAt: data.createdAt,
              },
              participants:
                authUser?.id !== data.senderId ? receiverSide : senderSide,
              type: "user",
              unseenMesssages: authUser?.id === data.senderId ? 0 : 1,
            });
          }
          return updatedCon;
        }
      );
    });

    socket?.on("group-message", (data: GroupMessageT) => {
      queryClient.setQueryData(
        ["conversations"],
        (oldCoversations: SidebarData[]) => {
          const updatedCon = oldCoversations.map(
            (conversation: SidebarData) => {
              if (conversation.id === data.groupId) {
                return {
                  ...conversation,
                  message: {
                    body: data.body,
                    conversationId: data.conversationId,
                    seen: data.seen,
                    createdAt: data.createdAt,
                  },
                  unseenMesssages:
                    authUser?.id === data.senderId
                      ? conversation.unseenMesssages
                      : conversation.unseenMesssages + 1,
                  participants: {
                    id: data.groupInfo?.id as string,
                    fullname: data.groupInfo?.fullname as string,
                    profilePic: "",
                    username: "",
                  },
                };
              }
              return conversation;
            }
          );
          if (!updatedCon.some((conv) => conv.id === data.groupId)) {
            updatedCon.push({
              id: data.groupId as string,
              message: {
                body: data.body,
                conversationId: data.conversationId,
                seen: data.seen,
                seenByIds: data.seenByIds,
                createdAt: data.createdAt,
              },
              participants: {
                id: data.groupInfo?.id as string,
                fullname: data.groupInfo?.fullname as string,
                profilePic: "",
                username: "",
              },
              type: "group",
              unseenMesssages: authUser?.id === data.senderId ? 0 : 1,
            });
          }
          return updatedCon;
        }
      );
    });
    return () => {
      socket?.off("new-message");
      socket?.off("group-message");
    };
  }, [socket, queryClient]);

  return (
    <aside className="bg-secondary w-full h-full  relative shadow-lg  overflow-hidden ">
      <div className=" flex items-center gap-x-3 justify-around  w-full p-2 py-4  bg-sky-200 ">
        <img
          src="/chatImage.png"
          alt="Logo"
          className="w-10 h-10 object-cover "
        />
        <Link to="/">
          <p className="text-2xl font-bold font-serif  text-center">CHAT APP</p>
        </Link>
        <CreateGroup />
      </div>
      <div className="rounded-full  absolute bottom-[7rem] right-[2rem]  z-[99999]">
        <SearchModal />
      </div>

      {/* conversations */}
      <div className="h-full flex-1  overflow-y-auto main-scrollbar">
        {isLoading &&
          Array.from({ length: 3 }, (_, index: number) => index).map(
            (_, i: number) => <UserSkeleton key={i} />
          )}
        {users?.length === 0 && !isLoading && (
          <p className="text-center text-sm text-muted-foreground py-10">
            Currently&apos;s you don&apos;t have any past conversations
          </p>
        )}

        {!isLoading &&
          users?.map((user: SidebarData) => (
            <SidebarItem
              key={user.participants.id}
              conversationId={user.id}
              id={user.participants.id}
              fullname={user.participants.fullname}
              lastMessage={user.message.body}
              profilePic={user.participants.profilePic}
              unseenMessages={user.unseenMesssages}
              type={user.type}
              createdAt={user.message.createdAt}
              isSeen={
                user.type === "group"
                  ? (user.message.seenByIds?.includes(
                      authUser?.id as string
                    ) as boolean)
                  : user.message.seen
              }
            />
          ))}
      </div>
      {/* footer */}
      <SidebarFooter />
    </aside>
  );
}
