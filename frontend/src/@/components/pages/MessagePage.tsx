import { FaComments } from "react-icons/fa";
import Header from "../shared/Header";
import MessageInput from "../shared/MessageInput";
import MessagesContainer from "../shared/MessagesContainer";
import useConversation from "../../../hooks/useConversation";
import { useQuery } from "@tanstack/react-query";
import { User } from "../../../types/type";
import { useParams } from "react-router-dom";

const MessagePage = () => {
  const { id: receiverId } = useParams();
  const { selectedConversation } = useConversation();

  const { data: authUser } = useQuery<User>({ queryKey: ["authUser"] });

  const isME = receiverId === authUser?.id;
  const isUserSelected = selectedConversation?.id === receiverId;

  return (
    <main
      className="w-full  h-full flex flex-col flex-1 overflow-hidden
    bg-gradient-to-tr from-sky-100 to-slate-100 via-indigo-300
    "
    >
      {isME ? (
        <>
          <Header type="home" />
          <div className="flex flex-col items-center justify-center p-8 mx-auto my-auto text-center    bg-indigo-100 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-30 rounded-lg shadow-md">
            <FaComments className="text-blue-500 text-6xl mb-4" />
            <h3 className="text-3xl font-serif text-gray-500">
              You are not allowed to chat with yourself
            </h3>
          </div>
        </>
      ) : (
        <>
          {!selectedConversation || !isUserSelected ? (
            <>
              <Header type="home" />
              <div className="flex flex-col items-center justify-center p-8 mx-auto my-auto text-center    bg-indigo-100 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-30 rounded-lg shadow-md">
                <FaComments className="text-blue-500 text-6xl mb-4" />
                <h3 className="text-3xl font-serif text-gray-500">
                  Select a user to start message
                </h3>
              </div>
            </>
          ) : (
            <>
              <Header type="message" />
              <MessagesContainer />
              <MessageInput />
            </>
          )}
        </>
      )}
    </main>
  );
};

export default MessagePage;
