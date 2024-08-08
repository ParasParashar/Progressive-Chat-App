import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useConversation from "../../../hooks/useConversation";
import { useParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import { FaComments, FaSpinner } from "react-icons/fa";
import {
  GroupMessageT,
  GroupMessageType,
  SidebarData,
  User,
} from "../../../types/type";
import axios from "axios";
import { formatDayOnly } from "../../../utils/date";
import GroupMessageCard from "./GroupMessageCard";
import { useSocketContext } from "../providers/SocketProvider";

const GroupMessageContainer = () => {
  const { data: authUser } = useQuery<User>({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();
  const { selectedConversation } = useConversation();
  const { id: groupId } = useParams();
  const messageRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const { socket } = useSocketContext();

  // getting the group  messages
  const { data, isPending, error } = useQuery({
    queryKey: ["getGroupMessage", groupId],
    queryFn: async () => {
      try {
        const res = await axios.get(`/api/group/message/${groupId}`);
        if (!res.data) throw new Error("Error in getting" || error?.message);
        return res.data;
      } catch (err: any) {
        throw new Error(err.message);
      }
    },
    // refetchInterval: 8000,
  });

  // update ui function

  const updateMessage = (data: GroupMessageT) => {
    queryClient.setQueryData(
      ["getGroupMessage", groupId],
      (oldConversations: GroupMessageType[] | undefined) => {
        if (groupId !== data.groupId) return;
        if (oldConversations) {
          return oldConversations.map((conversation) => {
            if (conversation.messages.some((msg) => msg.id === data.id)) {
              return {
                ...conversation,
                messages: conversation.messages.map((prev) =>
                  prev.id === data.id ? data : prev
                ),
              };
            }
            return conversation;
          });
        }
        return [];
      }
    );
    // update the sidebar conversations
    queryClient.setQueryData(
      ["conversations"],
      (oldConversations: SidebarData[]) => {
        if (!oldConversations) {
          return oldConversations;
        }
        return oldConversations.map((conversation: SidebarData) => {
          if (conversation.message.conversationId === data.conversationId) {
            return {
              ...conversation,
              unseenMesssages: 0,
            };
          }
          return conversation;
        });
      }
    );
  };

  // mutation for updating the seen status
  const { mutate } = useMutation({
    mutationFn: async ({ messageId }: { messageId: string }) => {
      const res = await axios.patch("/api/group/message/update", {
        messageId,
        groupId,
      });
      if (res.data.error) throw new Error(res.data.error);
      return res.data;
    },
    onSuccess: (data) => {
      updateMessage(data);
    },
  });

  useEffect(() => {
    if (groupId && socket) {
      socket.on("group-message-update", updateMessage);
      return () => {
        socket.off("group-message-update");
      };
    }
  }, [groupId, queryClient, socket, mutate]);

  // intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry: IntersectionObserverEntry) => {
          if (entry.isIntersecting) {
            const messageSeen = entry.target.getAttribute("data-message-seen");
            if (messageSeen === "true") return;
            const messageId = entry.target.getAttribute("data-message-id");
            const senderId = entry.target.getAttribute("data-sender-id");
            if (messageId && senderId !== authUser?.id) {
              mutate({ messageId });
            }
          }
        });
      },
      { threshold: 0.5 }
    );
    if (data) {
      observerRef.current.forEach((ref) => {
        if (ref) {
          observer.observe(ref);
        }
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [authUser?.id, selectedConversation?.id, data, groupId, mutate]);

  //  scrolling the container
  useEffect(() => {
    if (data) {
      const chatArea = messageRef.current;
      chatArea?.scrollTo({ top: chatArea.scrollHeight, behavior: "smooth" });
    }
  }, [data]);

  return (
    <div
      ref={messageRef}
      className="h-full flex flex-col gap-2 overflow-y-auto p-1 px-3  main-scrollbar"
    >
      {data?.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 mx-auto my-auto text-center bg-indigo-100 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-30 rounded-lg shadow-md">
          <FaComments className="text-blue-500 text-6xl mb-4" />
          <h3 className="text-3xl font-serif text-gray-500">
            Currently you don&apos;t have any previous conversations with &nbsp;
            {selectedConversation?.name} group
          </h3>
        </div>
      )}
      {!isPending &&
        data.map((userMessages: GroupMessageType) => (
          <div key={userMessages.date}>
            <div className="relative w-full z-10">
              <div className="absolute top-[50%] flex justify-center items-center z-0 w-full h-[2px] rounded-full bg-gray-500/50" />
              <div className=" flex justify-center z-[-10]">
                <p className=" text-gray-700 bg-gradient-to-tr z-20 from-sky-100 to-slate-100 via-indigo-300 inline-block px-2 py-1 rounded-lg shadow-lg">
                  {formatDayOnly(userMessages.date)}
                </p>
              </div>
            </div>
            {userMessages.messages.map((message: GroupMessageT) => (
              <div
                key={message.id}
                ref={(el) => el && observerRef.current.set(message.id, el)}
                data-message-id={message.id}
                data-sender-id={message.senderId}
                data-message-seen={message.seenByIds?.includes(
                  authUser?.id as string
                )}
                className="py-2"
              >
                <GroupMessageCard message={message} />
              </div>
            ))}
          </div>
        ))}

      {isPending && (
        <div className=" w-full flex  justify-center ">
          <FaSpinner className="animate-spin text-center " size="10" />
        </div>
      )}
    </div>
  );
};

export default GroupMessageContainer;
