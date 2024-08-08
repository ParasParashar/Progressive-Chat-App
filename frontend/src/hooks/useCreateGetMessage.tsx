import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "react-router-dom";
import { MessageType, SidebarData, User, UserMessageType } from "../types/type";
import { useEffect } from "react";
import { useSocketContext } from "../@/components/providers/SocketProvider";

export const useCreateMessage = () => {
  const { id } = useParams();
  const { data: authUser } = useQuery<User>({ queryKey: ["authUser"] });
  const { socket } = useSocketContext();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (message: string) => {
      const res = await axios.post(`/api/messages/send/${id}`, { message });
      if (!res.data) throw new Error("Error in sending message");
      return res.data;
    },
    onSuccess: (data: MessageType) => {
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
    },
  });

  const handleNewMessage = (data: MessageType) => {
    if (data.senderId === authUser?.id || data.senderId === id) {
      queryClient.setQueryData(
        ["getMessage", id],
        (oldConversations: UserMessageType[] | undefined) => {
          const messageDate = new Date(data.createdAt).toDateString();

          const updatedConversations = oldConversations?.map((conversation) => {
            if (conversation.date === messageDate) {
              return {
                ...conversation,
                messages: [...conversation.messages, data],
              };
            }
            return conversation;
          });

          if (
            !updatedConversations?.some((conv) => conv.date === messageDate)
          ) {
            updatedConversations?.push({
              date: messageDate,
              messages: [data],
            });
          }

          return updatedConversations;
        }
      );
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
    }
  };

  useEffect(() => {
    if (id && socket) {
      socket.on("new-message", handleNewMessage);

      return () => {
        socket.off("new-message");
      };
    }
  }, [id, queryClient, mutate, socket]);

  return {
    mutate,
    isPending,
  };
};
