import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "react-router-dom";
import { GroupMessageT, GroupMessageType } from "../types/type";
import { useEffect } from "react";
import { useSocketContext } from "../@/components/providers/SocketProvider";

export const useCreateGroupMessage = () => {
  const { id: groupId } = useParams();
  const queryClient = useQueryClient();
  const { socket } = useSocketContext();

  const { mutate, isPending } = useMutation({
    mutationFn: async (message: string) => {
      const res = await axios.post(`/api/group/message/send/${groupId}`, {
        message,
      });
      if (!res.data) throw new Error("Error in sending message");
      return res.data;
    },
  });

  useEffect(() => {
    if (groupId && socket) {
      socket.on("group-message", (data: GroupMessageT) => {
        queryClient.setQueryData(
          ["getGroupMessage", groupId],
          (oldConversations: GroupMessageType[] | undefined) => {
            if (groupId !== data.groupId) return;
            if (!oldConversations) return [];
            const messageDate = new Date(data.createdAt).toDateString();

            const updatedConversations = oldConversations.map(
              (conversation) => {
                if (conversation.date === messageDate) {
                  return {
                    ...conversation,
                    messages: [...conversation.messages, data],
                  };
                }
                return conversation;
              }
            );

            if (
              !updatedConversations.some((conv) => conv.date === messageDate)
            ) {
              updatedConversations.push({
                date: messageDate,
                messages: [data],
              });
            }

            return updatedConversations;
          }
        );
      });

      return () => {
        socket.off("group-message");
      };
    }
  }, [groupId, queryClient, socket, mutate]);

  return {
    mutate,
    isPending,
  };
};
