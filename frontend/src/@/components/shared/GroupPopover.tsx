import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CiMenuKebab } from "react-icons/ci";
import axios from "axios";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FaUser } from "react-icons/fa";
import { IoRemoveCircleOutline } from "react-icons/io5";

type props = {
  groupId: string;
  userId: string;
  groupMemberId: string;
};
type mutationType = "remove" | "add";
const GroupPopover = ({ groupId, userId, groupMemberId }: props) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (type: mutationType) => {
      try {
        const { data } = await axios.patch("/api/group/info/update", {
          groupId: groupId,
          userId: userId,
          groupMemberId: groupMemberId,
          type: type,
        });

        if (data.error) throw new Error(data.error || "deleting error");
        return data;
      } catch (error: any) {
        throw new Error(error.response.data.error || "Failed to update");
      }
    },
    onSuccess: (data: { message: string }) => {
      queryClient.invalidateQueries({ queryKey: ["groupInfo"] });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (type: mutationType, e: React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    mutate(type);
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
          size={"icon2"}
        >
          <CiMenuKebab size={20} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-3 w-auto flex flex-col gap-2 bg-indigo-200 border-none">
        <Button
          disabled={isPending}
          onClick={(e) => handleSubmit("add", e)}
          size={"lg"}
          variant={"ghost"}
          className="text-sm border 
          flex items-center justify-between
            group-hover:text-rose-800  group space-x-2"
        >
          <FaUser className="group-hover:text-rose-800" size={20} />
          Make Admin
        </Button>
        <Button
          disabled={isPending}
          onClick={(e) => handleSubmit("remove", e)}
          size={"lg"}
          variant={"ghost"}
          className="text-sm  flex items-center justify-between border  group-hover:text-rose-800  group space-x-2"
        >
          <IoRemoveCircleOutline
            className="group-hover:text-rose-800"
            size={20}
          />
          Remove user from group
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default GroupPopover;
