import EmojiPicker from "emoji-picker-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";

type EmojiProps = {
  onEmojiClick: (emojiObject: any, event: React.MouseEvent) => void;
};

const Emoji = ({ onEmojiClick }: EmojiProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <Button
        className="text-2xl ml-2 focus:outline-none rounded-full"
        size={"icon"}
        variant={"outline"}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        😀
      </Button>
      {isOpen && (
        <div ref={emojiPickerRef} className="absolute left-0 bottom-10 z-10">
          <EmojiPicker onEmojiClick={onEmojiClick as any} />
        </div>
      )}
    </div>
  );
};

export default Emoji;
