import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { FaSpinner } from "react-icons/fa";
import { LuLogOut } from "react-icons/lu";
import axios from "axios";
import toast from "react-hot-toast";
import { User } from "../../../types/type";

const SidebarFooter = () => {
  const queryClient = useQueryClient();
  const { data: authUser } = useQuery<User>({ queryKey: ["authUser"] });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const { data } = await axios.post("/api/auth/logout");
        if (data.error) throw new Error(data.error);
        return data;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    onSuccess: (data) => {
      toast.success(data.message || "Logged out successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Logout failed");
    },
  });

  const handleLogout = (e: React.FormEvent) => {
    e.preventDefault();
    mutate();
  };
  return (
    <div className="flex bg-secondary w-full p-2 flex-col absolute   left-0 z-50  bottom-0 gap-2">
      <div className="flex items-center justify-start  w-full  gap-x-2 ">
        <div className="relative  object-fill ">
          <img
            src={authUser?.profilePic}
            alt="User Image"
            className="  rounded-full object-contain  size-12"
          />
        </div>
        <div className=" w-full">
          <p className="text-lg md:text-xl font-sans    font-semibold ">
            {authUser?.fullname}
          </p>
          <div className="text-muted-foreground text-sm w-full flex items-center justify-between">
            @{authUser?.username}
            <Button
              onClick={handleLogout}
              size={"sm"}
              variant={"ghost"}
              className=" space-x-1 text-xs  ml-auto text-muted-foreground "
            >
              {isPending ? (
                <FaSpinner className="animate-spin" size={15} />
              ) : (
                <LuLogOut size={16} />
              )}
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarFooter;
