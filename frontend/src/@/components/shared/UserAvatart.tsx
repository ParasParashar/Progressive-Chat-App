import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

type props = {
  img?: string;
  name?: string;
  type: "group" | "user";
};
const UserAvatar = ({ img, name, type }: props) => {
  return (
    <Avatar>
      {type === "group" ? (
        <AvatarFallback className="bg-zinc-900/80 dark:bg-zinc-900 ring-2 text-white font-bold">
          {name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      ) : (
        <>
          <AvatarImage src={img} />
          <AvatarFallback className="bg-blue-700/50 font-semibold text-sm dark:bg-blue-800/70">
            {name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </>
      )}
    </Avatar>
  );
};

export default UserAvatar;
