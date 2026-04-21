"use client";


import { SidebarTrigger } from "@/components/ui/sidebar";


const Navbar = () => {
  
  return (
    <header className="flex sticky top-0 z-50 shadow-sm bg-white h-17">
      <div className="flex items-center justify-between gap-2 px-4  w-full">
        <div className=" ">
          <SidebarTrigger
        
            />
        </div>

        
      </div>
    </header>
  );
};

export default Navbar;