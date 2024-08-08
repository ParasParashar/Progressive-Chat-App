import { FaComments } from "react-icons/fa";
import useConversation from "../../../hooks/useConversation";
import Header from "../shared/Header";
import GroupHeader from "../shared/GroupHeader";
import GroupMessageInput from "../shared/GroupMessageInput";
import GroupMessageContainer from "../shared/GroupMessageContainer";
import { useParams } from "react-router-dom";
import { useSocketContext } from "../providers/SocketProvider";
import { useEffect } from "react";
import GroupInfoSidebar from "../shared/GroupInfoSidebar";
import { useQuery } from "@tanstack/react-query";
import { GroupInfo, MemberType, User } from "../../../types/type";
import axios from "axios";

export default function GroupMessagePage() {
  const { data: authUser } = useQuery<User>({ queryKey: ["authUser"] });
  const { selectedConversation } = useConversation();
  const { id: groupId } = useParams();
  const { socket } = useSocketContext();
  const { data, isLoading } = useQuery<GroupInfo>({
    queryKey: ["groupInfo"],
    queryFn: async () => {
      const res = await axios.get(`/api/group/info/${groupId}`);
      if (res.data.error)
        throw new Error(res.data.error || "Error in getting the group info");
      return res.data;
    },
  });

  const isUserGroupMember = data?.members
    .map((user: MemberType) => user.user.id)
    .includes(authUser?.id as string);

  const isuserAdmin = data?.members
    .filter((user: MemberType) => user.isAdmin)
    .map((user: MemberType) => user.user.id)
    .includes(authUser?.id as string);
  // adding groupId socket
  useEffect(() => {
    if (groupId && socket) {
      socket.emit("join-group", groupId);

      return () => {
        socket.emit("leave-group", groupId);
      };
    }
  }, [groupId, socket]);

  return (
    <main className="w-full  h-full flex flex-col flex-1 overflow-hidden  bg-gradient-to-tr from-sky-100 to-slate-100 via-indigo-300">
      {!isUserGroupMember && !isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 mx-auto my-auto text-center    bg-indigo-100 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-30 rounded-lg shadow-md">
          <FaComments className="text-blue-500 text-6xl mb-4" />
          <h3 className="text-3xl font-serif text-gray-500">
            You are not a allowed to access this group
          </h3>
          <p className="text-sm text-muted-foreground">
            You are not a member of this group
          </p>
        </div>
      ) : (
        <>
          {!selectedConversation ? (
            <>
              <Header type="home" />
              <div className="flex flex-col items-center justify-center p-8 mx-auto my-auto text-center    bg-indigo-100 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-30 rounded-lg shadow-md">
                <FaComments className="text-blue-500 text-6xl mb-4" />
                <h3 className="text-3xl font-serif text-gray-500">
                  Select a group to start conversation
                </h3>
              </div>
            </>
          ) : (
            <div className="flex relative  items-center w-full h-full">
              <section className="flex flex-col w-full h-full ">
                <GroupHeader isAdmin={isuserAdmin} />
                <GroupMessageContainer />
                <GroupMessageInput />
              </section>
              <GroupInfoSidebar />
            </div>
          )}
        </>
      )}
    </main>
  );
}
