const Loader = ({ fullScreen = false, size = "md" }) => {
  const dimension = size === "sm" ? "h-5 w-5" : size === "lg" ? "h-12 w-12" : "h-8 w-8";

  const spinner = (
    <div
      className={`${dimension} animate-spin rounded-full border-[3px] border-[#E2E8F0] border-t-[#2563EB]`}
    />
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">{spinner}</div>
    );
  }
  return spinner;
};

export default Loader;
