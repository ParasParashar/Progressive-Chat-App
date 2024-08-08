import { GrGroup } from "react-icons/gr";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTrigger,
} from "../ui/dialog";
import GroupCreation from "./GroupCreation";
import { DialogTitle } from "@radix-ui/react-dialog";

const CreateGroup = () => {
  return (
    <Dialog>
      <DialogTrigger>
        <div
          className="bg-indigo-600 hover:bg-indigo-50 hover:text-sky-800 rounded-full text-white transition-all duration-300 ease-in-out w-10 h-10  flex
           items-center  justify-center"
        >
          <GrGroup size={20} />
        </div>{" "}
      </DialogTrigger>
      <DialogContent className=" w-full overflow-y-auto main-scrollbar p-0 bg-sky-100 z-[999999999999]">
        <DialogTitle className="text-muted-foreground text-xl text-center p-2">
          Let&apos;s Create Group
        </DialogTitle>
        <DialogDescription className="p-0 text-center break-words">
          Create a group and Start a group chat with the users.
        </DialogDescription>
        <GroupCreation />
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroup;
