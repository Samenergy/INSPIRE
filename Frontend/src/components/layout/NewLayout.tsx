import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  User,
  Moon,
  Sun
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../utils";

export const Logo = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black dark:text-white py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-primary-main dark:bg-primary-light rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Ino Dashboard
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm text-black dark:text-white py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-primary-main dark:bg-primary-light rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};

export function NewLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { mode, toggleColorMode } = useTheme();

  const links = [
    {
      label: "Dashboard",
      href: "/",
      icon: (
        <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Accounts",
      href: "/accounts",
      icon: (
        <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Documents",
      href: "/documents",
      icon: (
        <FileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Profile",
      href: "/profile",
      icon: (
        <User className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: (
        <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-neutral-900">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink 
                  key={idx} 
                  link={link} 
                  className={cn(
                    location.pathname === link.href ? 
                    "bg-primary-light/10 dark:bg-primary-dark/20 text-primary-main dark:text-primary-light" : 
                    ""
                  )}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div 
              onClick={toggleColorMode}
              className="flex items-center justify-start gap-2 group/sidebar py-2 cursor-pointer"
            >
              {mode === 'dark' ? (
                <Sun className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
              ) : (
                <Moon className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
              )}
              <motion.span
                animate={{
                  display: open ? "inline-block" : "none",
                  opacity: open ? 1 : 0,
                }}
                className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
              >
                {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </motion.span>
            </div>
            <SidebarLink
              link={{
                label: "John Doe",
                href: "/profile",
                icon: (
                  <div className="h-7 w-7 flex-shrink-0 rounded-full bg-primary-main dark:bg-primary-light text-white flex items-center justify-center text-xs font-semibold">
                    JD
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex-1 md:ml-[60px] transition-all duration-300 ease-in-out">
        <div className="p-4 md:p-8 h-full overflow-auto px-6">
          {children}
        </div>
      </div>
    </div>
  );
}