import prisma from '../db/prisma.js';
import { redis } from "../redis/redisClient.js";
// creating message
export const createGroupMessageController = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { message } = req.body;
        const { id: groupId } = req.params;
        // finding the group
        const group = await prisma.group.findUnique({
            where: {
                id: groupId
            },
            include: {
                members: {
                    select: {
                        userId: true
                    }
                }
            }
        });
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        // Finding or creating the conversation
        let conversation = await prisma.conversation.findFirst({
            where: {
                groupId: groupId,
                isGroupChat: true,
            }
        });
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    groupId: groupId,
                    isGroupChat: true
                }
            });
        }
        const newMessage = await prisma.message.create({
            data: {
                senderId: senderId,
                body: message,
                groupId: groupId,
                conversationId: conversation.id,
                seenByIds: [senderId],
            },
            include: {
                sender: {
                    select: {
                        profilePic: true,
                        id: true,
                        fullname: true,
                        username: true,
                    }
                }
            }
        });
        await prisma.conversation.update({
            where: {
                id: conversation.id
            },
            data: {
                messages: {
                    connect: {
                        id: newMessage.id
                    }
                }
            }
        });
        const groupInfo = {
            id: group.id,
            fullname: group.name
        };
        const messageSend = { ...newMessage, groupInfo };
        // group.members.forEach((user) => {
        //     const reciverSocketId = getReceiverSocketId(user.userId)
        //     io.to(reciverSocketId).emit('group-message', messageSend)
        // });
        /* this is optional */
        // io.to(groupId).emit('group-message', messageSend);
        redis.publish(`group:${groupId}`, JSON.stringify({
            type: 'group-message',
            data: messageSend,
            groupMembers: group.members
        }));
        res.status(200).json(messageSend);
    }
    catch (error) {
        console.error(error.message, 'group message creation error');
        return res.status(500).json({ error: 'Server error' + error.message });
    }
};
// gettting a groupMessage
export const getGroupMessageController = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const conversation = await prisma.group.findUnique({
            where: {
                id: groupId,
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'asc'
                    },
                    select: {
                        id: true,
                        createdAt: true,
                        conversationId: true,
                        body: true,
                        seen: true,
                        senderId: true,
                        seenByIds: true,
                        sender: {
                            select: {
                                username: true,
                                id: true,
                                fullname: true,
                                profilePic: true
                            }
                        }
                    },
                },
                members: {
                    select: {
                        isAdmin: true,
                        user: {
                            select: {
                                username: true,
                                id: true,
                                fullname: true,
                                profilePic: true,
                            }
                        }
                    }
                }
            }
        });
        if (!conversation) {
            return res.status(200).json([]);
        }
        ;
        const obj = {};
        conversation.messages.forEach((item) => {
            const date = new Date(item.createdAt).toDateString();
            if (!obj[date]) {
                obj[date] = [];
            }
            ;
            obj[date].push(item);
        });
        const data = Object.entries(obj).map(([date, messages]) => ({
            date,
            messages,
        }));
        res.status(200).json(data);
    }
    catch (error) {
        console.error(error.message, 'group message creation error');
        return res.status(500).json({ error: 'Server error' + error.message });
    }
};
// function to create  a group
export const createGroupController = async (req, res) => {
    try {
        const adminId = req.user.id;
        const { name, members } = req.body;
        // finding conversation
        const group = await prisma.group.create({
            data: {
                name: name,
                members: {
                    create: [
                        {
                            user: {
                                connect: {
                                    id: adminId,
                                }
                            },
                            isAdmin: true,
                        },
                    ]
                }
            }
        });
        await Promise.all(members.map(async (userId) => {
            await prisma.groupMembership.create({
                data: {
                    groupId: group.id,
                    isAdmin: false,
                    userId: userId
                }
            });
        }));
        res.status(200).json({ groupId: group.id });
    }
    catch (error) {
        console.error(error.message, 'group creation error');
        return res.status(500).json({ error: 'Server error' + error.message });
    }
};
export const getGroupDataController = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.group.findUnique({
            where: { id: id }, select: {
                id: true,
                name: true,
            }
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            id: user.id,
            name: user.name,
        });
    }
    catch (error) {
        console.log('Error in getting user Data', error.message);
        res.status(500).json({ error: 'Server Error of getting the user' + error.message });
    }
};
// getting the group info with the members
export const getGroupInfo = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const groupInfo = await prisma.group.findUnique({
            where: {
                id: groupId
            },
            include: {
                members: {
                    select: {
                        id: true,
                        isAdmin: true,
                        user: {
                            select: {
                                id: true,
                                fullname: true,
                                username: true,
                                profilePic: true,
                            }
                        }
                    }
                },
            },
        });
        if (!groupInfo) {
            return res.status(404).json({ message: "Group not found" });
        }
        res.status(200).json(groupInfo);
    }
    catch (error) {
        console.log('Error in getting group info and member Data', error.message);
        res.status(500).json({ error: 'Server Error of getting the user' + error.message });
    }
};
// function to update the message of the group
export const groupMessageUpdateController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { messageId, groupId } = req.body;
        const group = await prisma.group.findUnique({
            where: {
                id: groupId
            },
            include: {
                members: {
                    select: {
                        userId: true
                    }
                }
            }
        });
        if (!group) {
            return res.status(200).json({ error: 'Group not found' });
        }
        ;
        const message = await prisma.message.findFirst({
            where: {
                id: messageId,
                groupId: groupId,
            },
            select: {
                seenByIds: true,
            }
        });
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }
        // checking and determine if the message should be marked as seen
        const allMembersSeen = group.members.every(member => message.seenByIds.includes(member.userId) || member.userId === userId);
        const messagesToUpdate = await prisma.message.update({
            where: {
                id: messageId,
            },
            data: {
                seen: allMembersSeen,
                seenByIds: {
                    set: message.seenByIds.includes(userId) ? message.seenByIds : [...message.seenByIds, userId]
                }
            },
            select: {
                id: true,
                seen: true,
                body: true,
                senderId: true,
                createdAt: true,
                seenByIds: true,
                conversationId: true,
                groupId: true,
                sender: {
                    select: {
                        id: true,
                        fullname: true,
                        profilePic: true,
                    }
                }
            },
        });
        // io.to(groupId).emit('group-message-update', messagesToUpdate);
        redis.publish(`group:${groupId}`, JSON.stringify({
            type: 'group-message-update',
            data: messagesToUpdate,
        }));
        res.status(200).json(messagesToUpdate);
    }
    catch (error) {
        console.log('Error in updating group message seen ', error.message);
        return res.status(500).json({ error: 'Server error: ' + error.message });
    }
};
// function to update the group memember admin or remvoe
export const groupMemberController = async (req, res) => {
    try {
        const { groupId, userId, type, groupMemberId } = req.body;
        const group = await prisma.group.findUnique({
            where: {
                id: groupId
            },
        });
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }
        ;
        if (type === 'add') {
            await prisma.groupMembership.update({
                where: {
                    id: groupMemberId
                },
                data: {
                    isAdmin: true,
                }
            });
        }
        if (type === 'remove') {
            await prisma.message.deleteMany({
                where: {
                    senderId: userId,
                    groupId: group.id
                }
            });
            await prisma.groupMembership.delete({
                where: {
                    id: groupMemberId
                }
            });
        }
        ;
        const message = type == 'add' ? 'become admin of the group' : 'removed from the group';
        res.status(200).json({ message: `Successfully!! Member ${message} ` });
    }
    catch (error) {
        console.log('Error in updating the group admin', error.message);
        res.status(500).json({ error: 'Server Error member of the  group' + error.message });
    }
};
// functino to add a new member to the group
export const addGroupMemberController = async (req, res) => {
    try {
        const { groupId, members } = req.body;
        if (!members && members.length === 0) {
            console.log('work');
            res.status(404).json({ error: "Please select a user to add to group" });
        }
        await Promise.all(members.map(async (userId) => {
            await prisma.groupMembership.create({
                data: {
                    groupId: groupId,
                    isAdmin: false,
                    userId: userId
                }
            });
        }));
        res.status(200).json({ message: ' Successfully!! New Members added' });
    }
    catch (error) {
        console.error(error.message, 'add new member to group error');
        return res.status(500).json({ error: 'Server error' + error.message });
    }
};
// function to leave a group
export const leaveGroupController = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        const group = await prisma.group.findUnique({
            where: {
                id: groupId
            },
        });
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }
        ;
        await prisma.message.deleteMany({
            where: {
                senderId: userId,
                groupId: group.id
            }
        });
        const memberInfo = await prisma.groupMembership.findFirst({
            where: {
                groupId: group.id,
                userId: userId
            }
        });
        if (!memberInfo) {
            return res.status(404).json({ error: "you are not a member of this group" });
        }
        ;
        await prisma.groupMembership.delete({
            where: { id: memberInfo.id }
        });
        res.status(200).json({ message: `Now you not the member of ${group.name}` });
    }
    catch (error) {
        console.log('Error in leaving the group', error.message);
        res.status(500).json({ error: 'Server Error leaving the  group' + error.message });
    }
};
// function to delete a group
export const deleteGroupController = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const group = await prisma.group.findUnique({
            where: {
                id: groupId
            },
        });
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }
        const conversation = await prisma.conversation.findFirst({
            where: {
                groupId: group.id,
                isGroupChat: true,
            }
        });
        if (conversation) {
            await prisma.message.deleteMany({
                where: {
                    conversationId: conversation.id,
                }
            });
            await prisma.conversation.delete({
                where: { id: conversation.id }
            });
        }
        await prisma.groupMembership.deleteMany({
            where: {
                groupId: group.id,
            }
        });
        await prisma.group.delete({
            where: { id: group.id }
        });
        res.status(200).json({ message: `Group deleted successfully` });
    }
    catch (error) {
        console.log('Error in deleting the group', error.message);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
};
// function to delete a group message
export const deleteGroupMessagesController = async (req, res) => {
    try {
        const { id: groupId } = req.params;
        const group = await prisma.group.findUnique({
            where: {
                id: groupId
            },
        });
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }
        await prisma.message.deleteMany({
            where: {
                groupId: group.id
            }
        });
        res.status(200).json({ message: `Group messages deleted successfully` });
    }
    catch (error) {
        console.log('Error in deleting messages of  the group', error.message);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
};
