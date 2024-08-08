import Header from "../shared/Header";

const HomePage = () => {
  return (
    <main className="flex flex-col items-center flex-1  min-h-screen w-full bg-gradient-to-tr from-sky-100 to-slate-100 via-indigo-300">
      <Header type="home" />

      <div className="flex flex-col items-center justify-center p-8 mx-auto my-auto text-center    bg-indigo-100 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-30 rounded-lg shadow-md">
        <img src="/chatImage.png" alt="image" />
        <h3 className="text-3xl font-serif text-white">
          Select a user to start chating💬💬💬
        </h3>
      </div>
    </main>
  );
};

export default HomePage;
