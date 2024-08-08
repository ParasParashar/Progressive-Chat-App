import MessageCard from "./MessageCard";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import useConversation from "../../../hooks/useConversation";
import { useEffect, useRef } from "react";
import { FaComments, FaSpinner } from "react-icons/fa";
import { useSocketContext } from "../providers/SocketProvider";
import {
  MessageType,
  SidebarData,
  User,
  UserMessageType,
} from "../../../types/type";
import { formatDayOnly } from "../../../utils/date";

const MessagesContainer = () => {
  const { data: authUser } = useQuery<User>({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();
  const { socket } = useSocketContext();
  const { selectedConversation } = useConversation();
  const { id } = useParams();
  const messageRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<Map<string, HTMLDivElement>>(new Map());

  // getting the messages
  const { data, isPending, error } = useQuery({
    queryKey: ["getMessage", id],
    queryFn: async () => {
      try {
        const res = await axios.get(`/api/messages/${id}`);
        if (!res.data) throw new Error("Error in getting" || error?.message);
        return res.data;
      } catch (err: any) {
        throw new Error(err.message);
      }
    },
    // refetchInterval: 8000,
  });

  // update message function
  const messageUpdate = (updatedMessage: MessageType) => {
    queryClient.setQueryData(
      ["getMessage", id],
      (oldData: UserMessageType[]) => {
        if (oldData) {
          return oldData.map((conversation) => {
            if (
              conversation.messages.some((msg) => msg.id === updatedMessage.id)
            ) {
              return {
                ...conversation,
                messages: conversation.messages.map((msg) =>
                  msg.id === updatedMessage.id ? updatedMessage : msg
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
          if (conversation.id === updatedMessage.conversationId) {
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
      const res = await axios.patch(`/api/messages/update/${id}`, {
        messageId,
      });
      if (res.data.error) throw new Error(res.data.error);
      return res.data;
    },
  });

  // for update message according to socket
  useEffect(() => {
    if (id && socket) {
      socket.on("updated-message", messageUpdate);

      return () => {
        socket.off("updated-message");
      };
    }
  }, [id, queryClient, data, socket, mutate]);

  // for scrolling
  useEffect(() => {
    if (data) {
      const chatArea = messageRef.current;
      chatArea?.scrollTo({ top: chatArea.scrollHeight, behavior: "smooth" });
    }
  }, [data]);

  // intersection observer for last message
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry: IntersectionObserverEntry) => {
          if (entry.isIntersecting) {
            const messageSeen = entry.target.getAttribute("data-message-seen");
            if (messageSeen === "true") return;
            const messageId = entry.target.getAttribute("data-message-id");
            const senderId = entry.target.getAttribute("data-sender-id");
            if (
              messageId &&
              senderId !== authUser?.id &&
              messageSeen === "false"
            ) {
              mutate({ messageId });
            }
          }
        });
      },
      { threshold: 0.4 }
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
  }, [authUser?.id, mutate, selectedConversation?.id, data, id]);

  return (
    <main
      ref={messageRef}
      className="h-full flex flex-col gap-2 overflow-y-auto  p-1 px-3 main-scrollbar"
    >
      {data?.length === 0 && (
        <div className="flex flex-col  items-center justify-center p-8 mx-auto my-auto text-center bg-indigo-100 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-30 rounded-lg shadow-md">
          <FaComments className="text-blue-500 text-6xl mb-4" />
          <h3 className="text-3xl font-serif text-gray-500">
            Currently you don&apos;t have any previous conversations with{" "}
            {selectedConversation?.fullname}.
          </h3>
        </div>
      )}
      {!isPending &&
        data.map((userMessages: UserMessageType) => (
          <div key={userMessages.date}>
            <div className="relative  z-10  ">
              <div className="absolute top-[50%]  flex justify-center items-center z-0 w-full h-[2px] rounded-full     bg bg-gradient-to-tl  from-gray-500/50  via-slate-600/20  to-blue-500/50" />
              <div className=" flex justify-center z-[-10]">
                <p className=" text-gray-700 bg-gradient-to-tr z-20 from-sky-100 to-slate-100 via-indigo-300 inline-block px-2 py-1 rounded-lg shadow-lg">
                  {formatDayOnly(userMessages.date)}
                </p>
              </div>
            </div>
            {userMessages.messages.map((message: MessageType) => (
              <div
                key={message.id}
                ref={(el) => el && observerRef.current.set(message.id, el)}
                data-message-id={message.id}
                data-sender-id={message.senderId}
                data-message-seen={message.seen}
                className="py-2"
              >
                <MessageCard message={message} />
              </div>
            ))}
          </div>
        ))}
      {isPending && (
        <div className=" w-full flex  justify-center ">
          <FaSpinner className="animate-spin text-center " size="10" />
        </div>
      )}
    </main>
  );
};

export default MessagesContainer;
