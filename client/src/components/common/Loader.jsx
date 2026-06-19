const Loader = ({ fullScreen = false, size = 'md' }) => {
  const sizeClasses = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

  const spinner = (
    <div
      className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-brand-200 border-t-brand-600`}
    />
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">{spinner}</div>
    );
  }

  return spinner;
};

export default Loader;
