import { RxCross2 } from "react-icons/rx";
import { useGroupInfoHook } from "../../../hooks/useSidebarHook";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import UserAvatar from "./UserAvatart";
import { UserSkeleton } from "../Loaders/UserSkeleton";
import GroupInfoCard from "./GroupInfoCard";
import { BiTrash } from "react-icons/bi";
import { CiLogout } from "react-icons/ci";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { formatGroupDate } from "../../../utils/date";
import { GroupInfo, MemberType, User } from "../../../types/type";
import AddUsersToGroup from "./AddUserToGroup";
import toast from "react-hot-toast";

const GroupInfoSidebar = () => {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: authUser } = useQuery<User>({ queryKey: ["authUser"] });
  const { data, isPending } = useQuery<GroupInfo>({ queryKey: ["groupInfo"] });
  const { isOpen, onClose } = useGroupInfoHook();

  const { mutate: leaveGroup, isPending: isLeavePending } = useMutation({
    mutationFn: async () => {
      try {
        const { data } = await axios.post("/api/group/leave", {
          groupId: groupId,
          userId: authUser?.id,
        });

        if (data.error) throw new Error(data.error || "Group leave error");
        return data;
      } catch (error: any) {
        throw new Error(error.response.data.error || "Failed to leave a group");
      }
    },
    onSuccess: (data: { message: string }) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      navigate("/");
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
  const { mutate: deleteGroup, isPending: isDeletePending } = useMutation({
    mutationFn: async () => {
      try {
        const { data } = await axios.delete(`/api/group/delete/${groupId}`);

        if (data.error) throw new Error(data.error || "Deleting group error");
        return data;
      } catch (error: any) {
        throw new Error(
          error.response.data.error || "Failed to delete  a group"
        );
      }
    },
    onSuccess: (data: { message: string }) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      navigate("/");
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const isuserAdmin = data?.members
    .filter((user: MemberType) => user.isAdmin)
    .map((user: MemberType) => user.user.id)
    .includes(authUser?.id as string);

  return (
    <aside
      className={cn(
        "hidden md:w-[450px]  h-full overflow-y-auto  transform transition-transform duration-300 ease-in-out main-scrollbar bg-gradient-to-br to-sky-100 from-slate-100 via-indigo-300",
        isOpen
          ? "block shadow-lg  md:relative fixed z-50  inset-0 translate-x-0    opacity-100"
          : "opacity-0 pointer-events-none z-0 translate-x-full"
      )}
    >
      <section
        className={cn(
          "flex flex-col  w-fulltransform transition-transform duration-300 h-full ease-in",
          isOpen ? "translate-x-0  opacity-100 " : "translate-x-full opacity-0 "
        )}
      >
        <div className="flex p-1 border-b items-center justify-between md:justify-around">
          <Button
            className="rounded-full"
            onClick={() => onClose()}
            variant={"ghost"}
            size={"icon"}
          >
            <RxCross2 size={20} />
          </Button>
          <h6 className="text-md text-muted-foreground  font-bold">
            Group Information
          </h6>
        </div>
        <div className="flex  items-center justify-between  px-3 p-3 border-b">
          <UserAvatar type="group" name="All three group" />
          <div>
            <h6 className="text-lg text-slate-500 font-bold">{data?.name}</h6>
            <p className="text-xs font-semibold text-gray-700/90">
              Group Created on {formatGroupDate(data?.createdAt)}
            </p>
          </div>
        </div>
        <span className="text-sm text-gray-500  font-semibold p-2">
          Members {data?.members?.length}
        </span>
        <div className="flex flex-col px-1 flex-1 gap-1 overflow-x-hidden h-3/4 overflow-y-auto main-scrollbar">
          {isPending
            ? Array.from({ length: 3 }, (_, index) => index + 1).map((item) => (
                <UserSkeleton key={item} />
              ))
            : data.members?.map((item: MemberType) => {
                return (
                  <GroupInfoCard
                    key={item.id}
                    username={item?.user?.username as string}
                    fullname={item.user.fullname}
                    userId={item.user.id}
                    profilePic={item.user.profilePic}
                    isAdmin={item.isAdmin}
                    isUserAdmin={isuserAdmin}
                    groupMemberId={item.id}
                    groupId={groupId as string}
                    isMe={item.user.id === authUser?.id}
                  />
                );
              })}
        </div>
        <div className="flex flex-col gap-1 p-2  py-3 bg-indigo-300/50">
          <Button
            disabled={isLeavePending || isPending || isDeletePending}
            variant={"destructive"}
            className="  flex items-center justify-between hover:opacity-70"
            onClick={(e) => {
              e.preventDefault();
              leaveGroup();
            }}
          >
            <CiLogout size={20} />
            Leave Group
          </Button>
          {isuserAdmin && (
            <>
              <AddUsersToGroup
                groupId={groupId as string}
                members={data?.members as MemberType[]}
                groupName={data?.sname as string}
              />
              <Button
                disabled={isLeavePending || isPending || isDeletePending}
                variant={"destructive"}
                className="flex items-center justify-between hover:opacity-70"
                onClick={(e) => {
                  e.preventDefault();
                  deleteGroup();
                }}
              >
                <BiTrash size={20} />
                Delete Group
              </Button>
            </>
          )}
        </div>
      </section>
    </aside>
  );
};

export default GroupInfoSidebar;
