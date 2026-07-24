import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext";
import { profileService } from "../services/profileService";
import type { Notification as AppNotification } from "../services/profileService";
import { 
  Terminal, LayoutDashboard, FileText, Briefcase, 
  Play, History, BarChart3, User, Settings, LogOut, 
  Menu, X, Bell, Moon, Sun, Laptop, Trash2, CheckSquare 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await profileService.getNotifications();
      if (response.success && Array.isArray(response.data)) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  useEffect(() => {
    // Only fetch notifications once we have a confirmed authenticated user.
    // Firing before auth is ready causes 401 "Missing token" errors.
    if (!user) return;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Polling every minute
    return () => clearInterval(interval);
  }, [user]);


  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length === 0) return;
    try {
      const response = await profileService.markNotificationsRead(unreadIds);
      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        showToast("Success", "All notifications marked as read.", "success");
      }
    } catch (error) {
      showToast("Error", "Failed to mark notifications as read.", "error");
    }
  };

  const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await profileService.deleteNotification(id);
      if (response.success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        showToast("Success", "Notification removed.", "success");
      }
    } catch (error) {
      showToast("Error", "Failed to delete notification.", "error");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowNotifications(false);
      setShowProfileMenu(false);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navigationItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Resumes", path: "/resume", icon: FileText },
    { name: "Job Descriptions", path: "/job-description", icon: Briefcase },
    { name: "Start Interview", path: "/interview/setup", icon: Play },
    { name: "Interview History", path: "/interview/history", icon: History },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Profile & Settings", path: "/profile", icon: User },
  ];

  const getPageTitle = () => {
    const matched = navigationItems.find(item => location.pathname.startsWith(item.path));
    if (location.pathname.includes("/resume/") && location.pathname.includes("/analyze")) {
      return "Resume ATS Analysis";
    }
    if (location.pathname.includes("/interview/") && location.pathname.includes("/session")) {
      return "Voice Interview Simulation";
    }
    if (location.pathname.includes("/interview/") && location.pathname.includes("/feedback")) {
      return "Interview Performance Feedback";
    }
    return matched ? matched.name : "Platform";
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-card-dark border-r border-slate-200/60 dark:border-slate-800/80 z-20 transition-all duration-300">
        <div className="h-16 flex items-center px-6 border-b border-slate-200/50 dark:border-slate-800/50 gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-purple to-accent-indigo flex items-center justify-center text-white">
            <Terminal className="w-5 h-5" />
          </div>
          <span className="font-heading font-bold text-lg tracking-tight bg-gradient-to-r from-accent-purple via-accent-indigo to-accent-cyan bg-clip-text text-transparent">
            InterviewAI
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-accent-indigo/10 text-accent-indigo dark:bg-accent-indigo/15 dark:text-accent-purple"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/40"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Footer Panel */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-accent-indigo/10 dark:bg-accent-purple/10 flex items-center justify-center text-accent-indigo dark:text-accent-purple font-bold">
              {user?.fullName.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                {user?.fullName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile Toggle Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative flex flex-col w-72 max-w-xs bg-white dark:bg-card-dark h-full shadow-2xl z-10 border-r border-slate-200 dark:border-slate-800"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-purple to-accent-indigo flex items-center justify-center text-white">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <span className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                    InterviewAI
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-accent-indigo/10 text-accent-indigo dark:bg-accent-indigo/15 dark:text-accent-purple"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-accent-indigo/10 dark:bg-accent-purple/10 flex items-center justify-center text-accent-indigo dark:text-accent-purple font-bold">
                    {user?.fullName.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Wrapper */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-bg-dark/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg sm:text-xl font-heading font-bold text-slate-900 dark:text-white my-0">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle (Dashboard Header) */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/40 dark:border-slate-700/40">
              <button
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-md transition-all ${
                  theme === "light" 
                    ? "bg-white text-accent-indigo shadow-sm" 
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
                title="Light Mode"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-md transition-all ${
                  theme === "dark" 
                    ? "bg-slate-900 text-accent-cyan shadow-sm" 
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
                title="Dark Mode"
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme("system")}
                className={`p-1.5 rounded-md transition-all ${
                  theme === "system" 
                    ? "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-sm" 
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
                title="System Theme"
              >
                <Laptop className="w-4 h-4" />
              </button>
            </div>

            {/* Notification Center */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 border border-slate-200/40 dark:border-slate-800 relative transition-all"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-bg-dark" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-2.5 w-80 max-h-96 overflow-hidden rounded-2xl bg-white dark:bg-card-dark border border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col z-50"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
                      <h4 className="text-sm font-semibold text-slate-950 dark:text-white">Notifications</h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-accent-indigo hover:text-accent-purple font-medium flex items-center gap-1"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          Mark read
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center">
                          <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                          <p className="text-xs text-slate-400 dark:text-slate-500">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-4 flex gap-3 group relative transition-colors ${
                              notif.isRead 
                                ? "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/20" 
                                : "bg-accent-indigo/5 dark:bg-accent-purple/5 hover:bg-accent-indigo/10 dark:hover:bg-accent-purple/10"
                            }`}
                          >
                            <div className="flex-1">
                              <h5 className={`text-xs font-semibold ${notif.isRead ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-white"}`}>
                                {notif.title}
                              </h5>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed pr-6">
                                {notif.message}
                              </p>
                              <span className="text-[10px] text-slate-400 dark:text-slate-600 block mt-1">
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <button
                              onClick={(e) => handleDeleteNotification(notif.id, e)}
                              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete notification"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="w-9 h-9 rounded-full bg-accent-indigo/10 dark:bg-accent-purple/10 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center text-accent-indigo dark:text-accent-purple font-bold text-sm hover:ring-2 hover:ring-accent-indigo/50 transition-all cursor-pointer"
              >
                {user?.fullName.charAt(0).toUpperCase() || "U"}
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2.5 w-52 rounded-2xl bg-white dark:bg-card-dark border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden z-50 divide-y divide-slate-100 dark:divide-slate-800"
                  >
                    <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-900/30">
                      <p className="text-sm font-semibold text-slate-950 dark:text-white truncate">{user?.fullName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => navigate("/profile")}
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-950 dark:hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </button>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-500/10 transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Panel */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
