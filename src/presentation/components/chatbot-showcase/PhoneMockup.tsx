import { ReactNode, forwardRef } from "react";
import { Battery, Signal, Wifi } from "lucide-react";

interface PhoneMockupProps {
  children: ReactNode;
}

export const PhoneMockup = forwardRef<HTMLDivElement, PhoneMockupProps>(({ children }, ref) => {
  return (
    <div ref={ref} className="relative w-full max-w-[375px] h-[600px] sm:h-[700px] lg:h-[812px] bg-black rounded-[2rem] sm:rounded-[3rem] p-2 sm:p-3 shadow-2xl animate-float mx-auto">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 sm:w-40 h-5 sm:h-7 bg-black rounded-b-2xl sm:rounded-b-3xl z-10" />
      
      <div className="w-full h-full bg-background rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col">
        <div className="bg-white px-4 py-2 flex items-center justify-between flex-shrink-0">
          <span className="text-gray-900 text-sm font-medium">9:41</span>
          <div className="flex items-center gap-1">
            <Signal className="w-3.5 h-3.5 text-gray-900" />
            <Wifi className="w-3.5 h-3.5 text-gray-900" />
            <Battery className="w-4 h-4 text-gray-900" />
          </div>
        </div>
        
        <div className="flex-1 min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
});

PhoneMockup.displayName = "PhoneMockup";

