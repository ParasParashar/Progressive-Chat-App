export type User = {
    id: string
    username?: string
    fullname: string
    profilePic: string
}
export type MemberType = {
    user: User,
    id: string
    isAdmin: boolean
}
export type GroupInfo = {
    id: string,
    name: string,
    members: MemberType[],
    createdAt: string,
}

export type MessageType = {
    id: string;
    body: string;
    senderId: string;
    seen: boolean;
    createdAt: string;
    conversationId?: string;
    receiver?: User
    sender?: User
};

export type GroupMessageT = {
    id: string;
    body: string;
    senderId: string;
    seen: boolean;
    createdAt: string;
    conversationId?: string;
    sender: User;
    groupId?: string;
    seenByIds?: string[];
    groupInfo?: {
        id: string,
        fullname: string
    }
}

export type UserMessageType = {
    date: string,
    messages: MessageType[] | [],
};

export type SidebarData = {
    message: {
        body: string
        conversationId: string
        seen: boolean
        seenByIds?: string[]
        createdAt: string
    },
    participants: User,
    id: string,
    unseenMesssages: number,
    type: 'group' | 'user'
}

export type SearchCardType = {
    id: string;
    type: "group" | "user";
    username?: string;
    name?: string;
    fullname?: string;
    profilePic?: string;
};

export type GroupMessageType = {
    date: string;
    messages: GroupMessageT[] | []

}

