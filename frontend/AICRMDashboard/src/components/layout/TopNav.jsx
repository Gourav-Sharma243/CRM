import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  User,
  LogOut,
  Sparkles,
  Check,
  CheckCheck,
  Clock,
  ExternalLink,
  X,
  Building2,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  Avatar,
  IconButton,
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from "../ui";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

const LINKS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/leads", label: "Leads" },
  { to: "/pipeline", label: "Pipeline" },
  { to: "/contacts", label: "Contacts" },
  { to: "/tasks", label: "Follow-ups" },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: "Deal Closed - Won!",
    desc: "Wayne Enterprises closed for $140,000",
    time: "2h ago",
    icon: DollarSign,
    color: "bg-emerald-100 text-emerald-700",
    unread: true,
    link: "/pipeline",
  },
  {
    id: 2,
    title: "High Priority Task Due",
    desc: "Finalize SLA & commercial contract for Globex",
    time: "4h ago",
    icon: Clock,
    color: "bg-amber-100 text-amber-700",
    unread: true,
    link: "/tasks",
  },
  {
    id: 3,
    title: "New Qualified Inbound Lead",
    desc: "Sarah Connor from Acme Cloud requested demo",
    time: "6h ago",
    icon: TrendingUp,
    color: "bg-sky-100 text-sky-700",
    unread: true,
    link: "/leads",
  },
  {
    id: 4,
    title: "AI Pipeline Analysis Ready",
    desc: "Gemini generated 3 closing recommendations",
    time: "1d ago",
    icon: Sparkles,
    color: "bg-violet-100 text-violet-700",
    unread: false,
    link: "/",
  },
];

export function TopNav({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close notifications on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [notifOpen]);

  // Global Ctrl+K shortcut for search palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const QUICK_SEARCH_ITEMS = [
    { title: "Wayne Enterprises", sub: "$140,000 · Won deal", type: "Lead", to: "/leads" },
    { title: "Globex Corporation", sub: "$85,000 · Won deal", type: "Lead", to: "/leads" },
    { title: "Sarah Connor", sub: "Acme Cloud · VP Engineering", type: "Contact", to: "/contacts" },
    { title: "Send finalized SLA to Globex", sub: "High Priority Task", type: "Task", to: "/tasks" },
    { title: "Pipeline Kanban Board", sub: "View active deals", type: "View", to: "/pipeline" },
  ].filter((item) =>
    searchQuery
      ? item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sub.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <>
      <header className="flex items-center gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 pr-2">
          <div className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="hidden font-display text-lg font-bold text-ink sm:block">
            Nexus CRM
          </span>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-ink-soft hover:bg-surface-muted lg:hidden cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Centered nav pill */}
        <nav className="mx-auto hidden items-center gap-1 rounded-full bg-surface p-1.5 shadow-[var(--shadow-soft)] lg:flex">
          {LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-5 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-surface-muted text-ink shadow-sm"
                    : "text-ink-soft hover:text-ink"
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-2">
          {/* Quick search button */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Quick Search (Ctrl+K)"
            title="Search (Ctrl+K)"
            className="hidden items-center gap-2 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs text-ink-soft transition hover:bg-surface-muted hover:text-ink sm:inline-flex cursor-pointer"
          >
            <Search className="h-4 w-4" />
            <span>Search...</span>
            <kbd className="rounded bg-canvas px-1.5 py-0.5 text-[10px] font-semibold text-ink-soft border border-line">
              Ctrl K
            </kbd>
          </button>

          {/* Notifications bell with interactive popover */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setNotifOpen((o) => !o)}
              aria-label="Notifications"
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink transition hover:bg-surface-muted cursor-pointer",
                notifOpen && "border-brand-400 bg-brand-50/50"
              )}
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 z-50 mt-2 w-80 sm:w-96 rounded-2xl border border-line bg-surface p-4 shadow-xl animate-fade-in">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-ink">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 transition cursor-pointer"
                    >
                      <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="mt-3 space-y-2 max-h-80 overflow-y-auto pr-1">
                  {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          setNotifOpen(false);
                          navigate(n.link);
                        }}
                        className={cn(
                          "flex items-start gap-3 rounded-xl p-2.5 transition cursor-pointer hover:bg-surface-muted",
                          n.unread && "bg-sky-50/60"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5",
                            n.color
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-semibold text-ink truncate">{n.title}</p>
                            <span className="text-[10px] text-ink-soft shrink-0">{n.time}</span>
                          </div>
                          <p className="text-xs text-ink-soft truncate">{n.desc}</p>
                        </div>
                        {n.unread && (
                          <span className="h-2 w-2 rounded-full bg-brand-600 shrink-0 mt-1.5" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 border-t border-line pt-2 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      navigate("/tasks");
                    }}
                    className="font-medium text-brand-600 hover:underline"
                  >
                    View All Tasks →
                  </button>
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      navigate("/leads");
                    }}
                    className="font-medium text-brand-600 hover:underline"
                  >
                    View All Leads →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User profile menu */}
          <Dropdown
            trigger={
              <button className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-2.5 transition hover:bg-surface-muted cursor-pointer">
                <Avatar name={user?.name} src={user?.avatar} size="sm" />
                <ChevronDown className="h-4 w-4 text-ink-soft" />
              </button>
            }
          >
            <DropdownLabel>{user?.email}</DropdownLabel>
            <DropdownSeparator />
            <DropdownItem onClick={() => navigate("/settings")}>
              <User className="h-4 w-4" /> Profile & settings
            </DropdownItem>
            <DropdownItem danger onClick={logout}>
              <LogOut className="h-4 w-4" /> Log out
            </DropdownItem>
          </Dropdown>
        </div>
      </header>

      {/* Quick Search Palette (Ctrl+K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 animate-fade-in">
          <div
            className="fixed inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-line bg-surface p-4 shadow-2xl z-10 animate-fade-up">
            <div className="flex items-center gap-2 border-b border-line pb-3">
              <Search className="h-5 w-5 text-ink-soft" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads, contacts, tasks... (Press ESC to close)"
                className="w-full bg-transparent text-sm text-ink placeholder-ink-soft focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-lg p-1 text-ink-soft hover:bg-surface-muted hover:text-ink cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-1 max-h-72 overflow-y-auto">
              {QUICK_SEARCH_ITEMS.length === 0 ? (
                <p className="py-6 text-center text-xs text-ink-soft">No matching items found.</p>
              ) : (
                QUICK_SEARCH_ITEMS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      navigate(item.to);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition hover:bg-surface-muted cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold text-ink">{item.title}</p>
                      <p className="text-[11px] text-ink-soft">{item.sub}</p>
                    </div>
                    <span className="rounded-md bg-canvas px-2 py-0.5 text-[10px] font-semibold text-ink-soft border border-line">
                      {item.type}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
