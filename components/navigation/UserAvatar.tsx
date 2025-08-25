"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  MdOutlineOnlinePrediction,
  MdOutlineDoNotDisturb,
} from "react-icons/md";
import { IoMdSunny, IoMdMoon } from "react-icons/io";
import { FaUserEdit, FaSignOutAlt } from "react-icons/fa";

export const UserAvatar = () => {
  const [open, setOpen] = useState(false);
  const [userStatus, setUserStatus] = useState("Online");
  const { data: session } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);

  function handleClickOutside(event: MouseEvent) {
      if ( dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setOpen(false);
  }
  useEffect(() => {
      if (open) document.addEventListener("mousedown", handleClickOutside);
      else document.removeEventListener("mousedown", handleClickOutside);

      return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      };
  }, [open]);
  const statusOptions = [
    { label: "Online", icon: MdOutlineOnlinePrediction, color: "text-green-500" },
    { label: "Idle", icon: IoMdSunny, color: "text-yellow-500" },
    { label: "Do Not Disturb", icon: MdOutlineDoNotDisturb, color: "text-red-500" },
    { label: "Invisible", icon: IoMdMoon, color: "text-gray-500" },
  ];

  // If session is not ready or no user, render nothing
  if (!session?.user) {
    return <></>;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Trigger */}
      <button
        onClick={() => {setOpen(!open); console.log("Line 30 Clicked",open)}}
        className="w-10 h-10 rounded-full bg-gray-300 dark:bg-zinc-700 flex items-center justify-center hover:ring-2 ring-offset-2 ring-blue-500 transition"
      >
        <span className="text-md font-semibold text-white uppercase">
          {session.user.name?.charAt(0)}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-12 bottom-6 mt-3 w-72 bg-white dark:bg-zinc-800 shadow-xl rounded-xl p-4 space-y-4 animate-fade-in">
          {/* User Info */}
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gray-300 dark:bg-zinc-700 rounded-full flex items-center justify-center text-xl font-bold uppercase text-white">
              {session.user.name?.charAt(0)}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {session.user.name}
              </p>
            </div>
          </div>

          {/* Edit Profile */}
          <button className="w-full flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 text-sm rounded-md transition">
            <FaUserEdit />
            Edit Profile
          </button>

          <div className="border-t border-gray-200 dark:border-zinc-600" />

          {/* Status Selector */}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Set Status</p>
            <div className="space-y-1">
              {statusOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => setUserStatus(option.label)}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm rounded-md transition ${
                    userStatus === option.label
                      ? "bg-gray-100 dark:bg-zinc-700"
                      : "hover:bg-gray-100 dark:hover:bg-zinc-700"
                  }`}
                >
                  <option.icon className={`${option.color}`} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-zinc-600" />

          {/* Logout */}
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
