const LoadingSpinner = ({ size = "md" }) => {
  const sizeClass = `loading-${size}`;

  return (
    <span
      className={`text-[20px] animate-spin transition-all duration-300 ${sizeClass}`}
    />
  );
};
export default LoadingSpinner;
