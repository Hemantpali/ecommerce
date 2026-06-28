import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const Loader = ({ fullScreen = false, size = 'md', className }) => {
  const sizeClasses = { 
    sm: 'h-4 w-4', 
    md: 'h-8 w-8', 
    lg: 'h-12 w-12' 
  };

  const spinner = (
    <Loader2 
      className={cn(
        'animate-spin text-primary opacity-85', 
        sizeClasses[size], 
        className
      )} 
    />
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-background transition-colors duration-200">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-4 w-full">
      {spinner}
    </div>
  );
};

export default Loader;
