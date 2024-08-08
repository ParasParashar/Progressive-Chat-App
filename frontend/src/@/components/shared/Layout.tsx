import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <main className="flex flex-col w-full h-screen  ">
      <div className="flex  w-full h-full">
        <div className="hidden md:block w-72">
          <Sidebar />
        </div>
        <Outlet />
      </div>
    </main>
  );
};

export default Layout;
