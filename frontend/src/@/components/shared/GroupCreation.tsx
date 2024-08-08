import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { UserSkeleton } from "../Loaders/UserSkeleton";
import { Input } from "../ui/input";
import { User } from "../../../types/type";
import { Button } from "../ui/button";
import { IoIosRemoveCircle } from "react-icons/io";
import { cn } from "../../lib/utils";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useSidebarHook from "../../../hooks/useSidebarHook";

type SelectUserType = {
  userId: string;
  name: string;
};

export default function GroupCreation() {
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectUser, setSelectUser] = useState<SelectUserType[]>([]);
  const { onClose } = useSidebarHook();
  const navigate = useNavigate();
  const groupInputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();

  const fetchUsers = async (query: string) => {
    const endpoint = query
      ? `/api/messages/users?query=${query}`
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

  const { data, isLoading } = useQuery({
    queryKey: ["users", debouncedQuery],
    queryFn: () => fetchUsers(debouncedQuery),
    enabled: true,
  });
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(handler);
  }, [query]);

  const handleSelect = (obj) => {
    setSelectUser((prev) => {
      const prevIds = prev?.map((user) => user.userId);
      if (prevIds?.includes(obj.userId)) {
        return prev;
      } else {
        const updateValue = [...prev, obj];
        return updateValue;
      }
    });
    setQuery("");
    groupInputRef?.current?.focus();
  };

  const handleRemove = (id: string) => {
    const updatedValue = selectUser?.filter((item) => {
      return item.userId !== id;
    });
    setSelectUser(updatedValue);
  };

  const handleBackSpaceDelete = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && selectUser?.length > 0) {
      const lastElementId = selectUser[selectUser.length - 1].userId;
      handleRemove(lastElementId);
    }
    if (e.key === "Enter" && data.length > 0) {
      const obj = {
        userId: data[0].id,
        name: data[0].username,
      };
      handleSelect(obj);
    }
  };

  // mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await axios.post("/api/group/create", {
        name: name,
        members: selectUser.map((item) => item.userId),
      });
      if (res.data.error) throw new Error(res.data.error || "Server error");
      return res.data;
    },
    onSuccess: (data) => {
      navigate(`/group/${data.groupId}`);
      toast.success("Group created sucessfully");
      onClose();
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: any) => {
      toast.error(error.message);
      console.log(error.message);
    },
  });

  return (
    <div className="w-full h-full flex flex-col  justify-between  relative bg-transparent border-gray-700 p-5 gap-3 ">
      <div className=" space-y-1">
        <label htmlFor="groupName" className="text-muted-foreground text-xs">
          Group Name
        </label>
        <Input
          id="groupName"
          autoFocus
          className="w-full rounded-lg border-none outline-none text-lg font-serif px-2 p-1 bg-secondary  "
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your group name"
          autoComplete="off"
        />
      </div>
      <label htmlFor="searchUser " className="text-muted-foreground text-xs">
        Select Members
      </label>
      <div className="flex flex-wrap gap-1 bg-secondary rounded-lg border w-full p-1">
        {selectUser?.map((item) => (
          <div key={item.userId} className="relative group">
            <Button
              variant="outline"
              size="sm"
              className=" cursor-text group-hover:border-black rounded-full"
            >
              {item.name}
            </Button>
            <IoIosRemoveCircle
              onClick={() => handleRemove(item.userId)}
              size={18}
              className="absolute  opacity-60 cursor-pointer  group-hover:opacity-100 top-[-2px] left-0 text-rose-600"
            />
          </div>
        ))}
        <input
          id="searchUser"
          autoFocus
          ref={groupInputRef}
          className="border-none bg-secondary  outline-none text-lg p-1"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          placeholder="Search group members..."
          onKeyDown={(e) => handleBackSpaceDelete(e)}
        />
      </div>
      {isLoading && <UserSkeleton />}
      {data?.length === 0 && (
        <p className="text-lg text-muted-foreground text-center px-2 py-5">
          No users found with this name
        </p>
      )}
      <div className="flex-1 overflow-y-auto overflow-hidden main-scrollbar">
        {data?.length > 0 && (
          <ul className="flex flex-col overflow-hidden transition-all duration-300 ease-in gap-2 mt-2">
            {data?.map((item: User) => {
              const inGroup = selectUser
                .map((item) => item.userId)
                .includes(item.id);

              return (
                <section
                  key={item.id}
                  onClick={() =>
                    handleSelect({ userId: item.id, name: item.username })
                  }
                  className={cn(
                    "flex cursor-pointer   group  rounded-lg items-center gap-2 border-b-2 border-slate-300 shadow-inner dark:border-slate-700 p-1 hover:bg-white dark:hover:bg-slate-600/80 hover:shadow-lg ",
                    inGroup &&
                      " bg-secondary hover:bg-secondary dark:bg-slate-600/80  hover:shadow-none "
                  )}
                >
                  <div className="relative object-cover rounded-full w-10 h-10 ">
                    <img
                      src={item.profilePic}
                      alt="User Image"
                      className="w-full h-full object-contain"
                    />
                  </div>{" "}
                  <div className="flex flex-col p-1">
                    <p
                      className={cn(
                        "text-sm font-light group-hover:font-semibold",
                        inGroup && "font-semibold"
                      )}
                    >
                      {item.fullname}
                    </p>
                    <p
                      className={cn(
                        "text-xs font-light  group-hover:font-normal text-muted-foreground",
                        inGroup && "font-normal"
                      )}
                    >
                      @{item.username}
                    </p>
                  </div>
                </section>
              );
            })}
          </ul>
        )}
      </div>
      <Button
        onClick={(e) => {
          e.preventDefault();
          mutate();
        }}
        variant="ghost"
        size={"lg"}
        disabled={name.trim() === "" || selectUser.length === 0 || isPending}
        className="w-full text-white bg-blue-400 hover:bg-blue-500 text-sm hover:text-white rounded-lg  "
      >
        Create Group
      </Button>
    </div>
  );
}
