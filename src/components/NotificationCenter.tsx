"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, FileText } from "lucide-react";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/app/actions/reminder";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const result = await getNotifications();
      if (result.success && result.data) {
        setNotifications(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await markNotificationAsRead(id);
      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const result = await markAllNotificationsAsRead();
      if (result.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative font-sans select-none" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors focus:outline-none flex items-center justify-center shrink-0 shadow-sm"
        title="Notifications"
      >
        <Bell className="h-4.5 w-4.5 text-slate-650" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-600 text-[9px] font-black text-white ring-2 ring-white animate-in zoom-in duration-200">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                {unreadCount} UNREAD ALERT{unreadCount !== 1 ? "S" : ""}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="h-7 text-[10px] font-black text-sky-700 hover:text-sky-800 hover:bg-sky-50 rounded-md"
              >
                <CheckCheck className="mr-1 h-3.5 w-3.5" />
                Mark all as read
              </Button>
            )}
          </div>

          <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-100">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 flex gap-3 transition-colors hover:bg-slate-50/40 relative ${
                    !notif.isRead ? "bg-sky-50/10" : ""
                  }`}
                >
                  <div className="p-2 h-9 w-9 bg-amber-50 text-amber-600 rounded-lg shrink-0 flex items-center justify-center border border-amber-100">
                    <Bell className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0 pr-6">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800 block">
                        {notif.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-650 font-medium leading-relaxed break-words whitespace-pre-line">
                      {notif.message}
                    </p>
                    <span className="text-[9px] text-slate-400 font-bold block">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(notif.id, e)}
                      className="absolute right-3 top-4 p-1 rounded-md text-slate-350 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="Mark as read"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="py-12 px-4 text-center">
                <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs text-slate-400 font-bold">No notifications</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  We'll let you know when laboratory incubation results are due.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
