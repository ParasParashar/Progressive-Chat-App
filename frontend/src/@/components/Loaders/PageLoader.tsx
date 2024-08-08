import LoadingSpinner from "./LoadingSpinner";

const PageLoader = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
};

export default PageLoader;
