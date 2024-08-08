import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { RiMessage3Fill } from "react-icons/ri";
import SearchUser from "./SearchUser";
import { DialogDescription } from "@radix-ui/react-dialog";

const SearchModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="bg-indigo-600 hover:bg-indigo-50 hover:text-sky-800 rounded-full text-white transition-all duration-300 ease-in-out w-12 h-12 flex items-center justify-center">
          <RiMessage3Fill size={26} />
        </div>
      </DialogTrigger>
      <DialogContent className="w-full h-3/4 overflow-y-auto main-scrollbar z-[999999999999]">
        <DialogHeader>
          <DialogTitle className="text-muted-foreground">
            Start new chat
          </DialogTitle>
          <DialogDescription className="p-1 text-center text-muted-foreground break-words">
            Here only those group come in which you are a member.
          </DialogDescription>
          <SearchUser />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
