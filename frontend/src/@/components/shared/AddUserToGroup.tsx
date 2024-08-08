"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useEffect, useState } from "react";
import { FaSpinner, FaUserCheck } from "react-icons/fa";
import { IoPersonAddSharp, IoPersonRemoveSharp } from "react-icons/io5";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { MemberType, User } from "../../../types/type";
import { IoIosPersonAdd } from "react-icons/io";
import { cn } from "../../lib/utils";
import { UserSkeleton } from "../Loaders/UserSkeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

type groupProps = {
  groupName: string;
  members: MemberType[];
  groupId: string;
};

const AddUsersToGroup = ({ groupName, members, groupId }: groupProps) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectUser, setSelectUser] = useState<String[]>([]);

  const fetchUsers = async (query: string) => {
    const endpoint = query
      ? `/api/messages/users?query=${search}`
      : `/api/messages/users`;
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      if (data?.error) throw new Error(data.error);
      return data;
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const { data: result, isLoading } = useQuery({
    queryKey: ["users", debouncedQuery],
    queryFn: () => fetchUsers(debouncedQuery),
    enabled: true,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const res = await axios.post("/api/group/addmembers", {
          groupId,
          members: selectUser,
        });
        if (res.data.error)
          throw new Error(res.data.error || "Something went wrong");
        return res.data;
      } catch (error: any) {
        console.log(error);
      }
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setSelectUser([]);
      queryClient.invalidateQueries({ queryKey: ["groupInfo"] });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast.success(error.message);
    },
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(search);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  //   select the user
  const handleSelectUnselect = (userId: string) => {
    if (selectUser.includes(userId)) {
      const updatedSelect = selectUser.filter((item) => item !== userId);
      setSelectUser(updatedSelect);
    } else {
      setSelectUser((prev) => [...prev, userId]);
    }
  };
  // confirm the collections
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        onClick={() => setIsOpen(true)}
        className="w-full bg-blue-400 hover:bg-sky-400 flex items-center justify-between hover:opacity-70 p-1 px-2 rounded-lg font-semibold text-white"
      >
        <IoIosPersonAdd size={20} />
        Add User
      </DialogTrigger>
      <DialogContent className=" rounded-lg  space-y-3 bg-sky-100">
        <DialogHeader>
          <DialogTitle className="text-center truncate">
            Add User to {groupName} group
          </DialogTitle>
          <DialogDescription>Search user to add in the group</DialogDescription>
          <Input
            autoFocus
            className="w-full rounded-lg border-none outline-none text-lg p-1   bg-secondary "
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search User"
          />
          {isLoading &&
            Array.from({ length: 3 }, (_, index: number) => index).map(
              (_, i: number) => <UserSkeleton key={i} />
            )}

          {result?.length > 0 && !isLoading ? (
            <div className="flex transition-all duration-300 ease-in-out  flex-col gap-2 mt-2 p-1">
              {result?.map((item: User) => {
                const isMember = members
                  .map((user) => user.user.id)
                  .includes(item.id);
                const isSelected = selectUser?.includes(item.id);
                return (
                  <section
                    key={item.id}
                    className={cn(
                      "flex  w-full  justify-between  group  rounded-lg items-center gap-2  bg-indigo-50  p-1  hover:bg-indigo-50 ",
                      isMember && " bg-indigo dark:bg-slate-600/80  "
                    )}
                  >
                    <div className="flex items-center justify-start gap-1">
                      <div className="relative object-cover rounded-full w-12 h-12 ">
                        <img
                          src={item.profilePic}
                          alt="User Image"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div
                        className={cn(
                          "text-sm font-light text-left  line-clamp-2 group-hover:font-semibold",
                          isMember && "font-semibold p-1"
                        )}
                      >
                        {item.fullname}
                        <p className="text-sm text-muted-foreground">
                          {item.username}
                        </p>
                      </div>
                    </div>
                    {isMember ? (
                      <div className="flex rounded-full line-clamp-1 bg-gray-400 dark:bg-sky-300 text-secondary text-xs p-1">
                        <FaUserCheck size={15} className="text-sky-500" />
                        <span className="hidden lg:block">
                          Already a member
                        </span>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleSelectUnselect(item.id)}
                        className="flex group-hover:border-blue-500 border transition-all duration-200 ease-in rounded-full line-clamp-1 bg-secondary text-primary text-xs p-1 cursor-pointer"
                      >
                        {isSelected ? (
                          <>
                            <IoPersonRemoveSharp
                              size={15}
                              className="text-red-500"
                            />
                            Remove-
                          </>
                        ) : (
                          <>
                            <IoPersonAddSharp
                              size={15}
                              className="text-blue-500"
                            />
                            <span>Add +</span>
                          </>
                        )}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          ) : (
            <p className="text-lg text-muted-foreground mt-4 text-center">
              No User Found
            </p>
          )}
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={handleClick}
            disabled={selectUser.length === 0 || isPending}
            variant="outline"
            size="lg"
            className="w-full bg-blue-500 hover:bg-blue-400 transition-all ease-in rounded-lg"
          >
            {isPending && <FaSpinner className="animate-spin" size={20} />}
            Add users
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUsersToGroup;
