import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { FaSpinner } from "react-icons/fa";

const LoginPage = () => {
  const [formInput, setFormInput] = useState({
    username: "",
    password: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormInput({ ...formInput, [e.target.name]: e.target.value });
  };

  const queryClient = useQueryClient();
  const { mutate, isError, isPending, error } = useMutation({
    mutationFn: async () => {
      try {
        const res = await axios.post("/api/auth/login", {
          username: formInput.username,
          password: formInput.password,
        });

        if (res.status >= 400) {
          throw new Error(res.data.error || "Failed to login");
        }

        return res.data;
      } catch (error: any) {
        throw new Error(error.response.data.error || "Failed to login");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate();
  };

  return (
    <div className="flex items-center justify-center min-h-screen  bg-gradient-to-br from-sky-200 to-blue-500 via-sky-900/80  ">
      <div className="max-w-md w-full space-y-6 p-8 shadow-md rounded-lg bg-indigo-100  bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-30  ">
        <h1 className="text-4xl font-bold text-center text-white">
          Login to <span className="text-slate-600">CHAT-APP</span>
        </h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="Enter username"
              value={formInput.username}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-200 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter Password"
              value={formInput.password}
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-200 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>
          {isError && (
            <p className="text-red-500 text-center">{error.message}</p>
          )}

          <div className="flex items-center justify-between">
            <Link
              to="/signup"
              className="text-sm text-gray-700 group hover:text-blue-500"
            >
              Don't have an account?
              <span className="text-white group-hover:text-blue-400 ">
                &nbsp;Sign up
              </span>
            </Link>
            <Button
              size={"lg"}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-500"
            >
              {isPending ? (
                <FaSpinner size={10} className="animate-spin" />
              ) : (
                "Login"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
