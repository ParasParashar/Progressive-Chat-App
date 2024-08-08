import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CiMenuKebab } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import useConversation from "../../../hooks/useConversation";
import axios from "axios";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "../Loaders/LoadingSpinner";
import { useNavigate } from "react-router-dom";

type props = {
  type: "conversation" | "chat" | "group";
  conversationId?: string;
};

const MenuPopover = ({ type, conversationId }: props) => {
  const { selectedConversation } = useConversation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const getUrl = () => {
    switch (type) {
      case "conversation":
        return `/api/messages/conversation/${conversationId}`;
      case "chat":
        return `/api/messages/conversation/chat/${selectedConversation?.id}`;
      case "group":
        return `/api/group/messagesdelete/${selectedConversation?.id}`;
      default:
        return "/api";
    }
  };

  const endPoint = getUrl();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const { data } = await axios.delete(endPoint);

        if (data.error) throw new Error(data.error || "deleting error");
        return data;
      } catch (error: any) {
        throw new Error(
          error.response.data.error || "Failed to delete message"
        );
      }
    },
    onSuccess: (data) => {
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["getMessage", selectedConversation?.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["conversations"],
        }),
      ]);
      if (type == "conversation") {
        navigate("/");
      }
      if (type == "group") {
        queryClient.invalidateQueries({
          queryKey: ["getGroupMessage", selectedConversation?.id],
        });
      }
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    mutate();
  };

  return (
    <Popover>
      <PopoverTrigger
        asChild
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
        }}
      >
        <Button
          variant={"ghost"}
          className=" hover:bg-secondary w-7 h-7  rounded-full"
          size={"icon"}
        >
          <CiMenuKebab size={20} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-3 w-auto">
        <Button
          disabled={isPending}
          onClick={handleSubmit}
          size={"lg"}
          variant={"destructive"}
          className="text-sm   group-hover:text-rose-800  group space-x-2"
        >
          {isPending ? (
            <LoadingSpinner size="sm text-black" />
          ) : (
            <MdDelete className="group-hover:text-rose-800" size={20} />
          )}
          {type === "chat" ? "   Clear Chat" : "Delete conversation"}
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default MenuPopover;
