import { BiMenu } from "react-icons/bi";
import useSidebarHook from "../../../hooks/useSidebarHook";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import Sidebar from "./Sidebar";
import { Cross2Icon } from "@radix-ui/react-icons";

const MobileSidebar = () => {
  const { isOpen, onOpen, onClose } = useSidebarHook();
  return (
    <Sheet open={isOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          onClick={() => onOpen()}
          variant={"ghost"}
          className="rounded-full flex items-center justify-center md:hidden text-center"
        >
          <BiMenu size={25} />
        </Button>
      </SheetTrigger>
      <SheetContent side={"left"} className="p-0 w-full ">
        <SheetClose
          className="absolute  top-1 right-2 z-50"
          onClick={() => onClose()}
        >
          <Cross2Icon className="h-6 w-6 z-50" />
        </SheetClose>
        <SheetTitle />
        <SheetDescription />
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
