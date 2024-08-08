import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { SearchCardType } from "../../../types/type";
import { UserSkeleton } from "../Loaders/UserSkeleton";
import SearchCard from "./SearchCard";

const SearchUser = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const fetchUsers = async (query: string) => {
    const endpoint = query
      ? `/api/messages/searchuser?query=${query}`
      : `/api/messages/searchuser`;
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      if (data?.error) throw new Error(data.error);
      return data;
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["users", debouncedQuery],
    queryFn: () => fetchUsers(debouncedQuery),
    enabled: true,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(handler);
  }, [query]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div className="w-full h-full  relative bg-transparent border-gray-700">
      <div className="px-2 p-1 sticky">
        <Input
          type="text"
          className=" w-full p-1 text-md resize-none shadow-none focus-visible:ring-0   outline-none"
          placeholder="Search User e.g. 'Paras'"
          value={query}
          autoFocus
          onChange={handleChange}
        />
      </div>
      {isLoading && <UserSkeleton />}
      {data?.length === 0 && (
        <p className="text-lg text-muted-foreground text-center px-2 py-5">
          No users found with this name
        </p>
      )}
      <div className="flex-1 overflow-y-auto overflow-hidden main-scrollbar">
        {data?.length > 0 && (
          <ul className="flex flex-col overflow-hidden transition-all duration-300 ease-in gap-2 mt-2">
            {data.map((data: SearchCardType) => (
              <SearchCard
                key={data.id}
                type={data.type}
                username={data?.username}
                fullname={data?.fullname}
                profilePic={data?.profilePic}
                name={data?.name}
                id={data.id}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchUser;
