import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ConversationType = {
  id: string;
  fullname?: string;
  profilePic?: string;
  name?: string;
  type: "user" | "group";
};

interface ConversationState {
  selectedConversation: ConversationType | null;
  setSelectedConversation: (conversation: ConversationType | null) => void;
}

// here we use persist to store and the converssationt to localStorage but we also use it asynchronously to interact with db

// const useConversation = create(persist<ConversationState>((set) => ({
//       selectedConversation: null,
//       setSelectedConversation: async (conversation) => {
//         set({ selectedConversation: conversation });
//         try {
//           const url =
//             conversation?.type === "user"
//               ? `/api/auth/userdata/${conversation?.id}`
//               : `/api/group/groupdata/${conversation?.id}`;
//           const response = await axios.get(url);
//           console.log(response.data);
//           set({ selectedConversation: response.data });
//         } catch (error) {
//           console.error("Failed to fetch conversation:", error);
//           set({ selectedConversation: conversation });
//         }
//       },
//     }),
//     {
//       name: "selected-conversation",
//     }
//   )
// );

//  here we use persist to store the conversation in the localStorage
const useConversation = create(
  persist<ConversationState>(
    (set) => ({
      selectedConversation: null,
      setSelectedConversation: (conversation) =>
        set({ selectedConversation: conversation }),
    }),
    {
      name: "selected-conversation",
    }
  )
);

export default useConversation;
