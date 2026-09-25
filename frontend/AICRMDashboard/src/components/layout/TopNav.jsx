import { useState, useRef, useEffect, useMemo } from "react";
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
  ArrowRight,
} from "lucide-react";
import {
  Avatar,
  Badge,
  IconButton,
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  Spinner,
} from "../ui";
import { useAuth } from "../../context/AuthContext";
import { leadsApi } from "../../lib/services";
import { currency } from "../../lib/format";
import { STAGE_STYLES } from "../../lib/constants";
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
  const [realLeads, setRealLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Fetch real leads whenever search palette is opened
  useEffect(() => {
    if (searchOpen && realLeads.length === 0) {
      setLoadingLeads(true);
      leadsApi
        .list()
        .then((res) => {
          setRealLeads(res.leads || []);
        })
        .catch(() => {})
        .finally(() => setLoadingLeads(false));
    }
  }, [searchOpen, realLeads.length]);

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

  // Filter real leads dynamically
  const filteredLeads = useMemo(() => {
    if (!realLeads || realLeads.length === 0) return [];
    if (!searchQuery.trim()) return realLeads.slice(0, 8);
    const q = searchQuery.toLowerCase().trim();
    return realLeads.filter(
      (l) =>
        l.name?.toLowerCase().includes(q) ||
        l.company?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.phone?.toLowerCase().includes(q) ||
        l.status?.toLowerCase().includes(q)
    );
  }, [realLeads, searchQuery]);

  const NAV_SHORTCUTS = [
    { title: "Dashboard", sub: "Analytics, KPIs & pipeline overview", to: "/", type: "Page" },
    { title: "Pipeline Board", sub: "Drag & drop Kanban deals", to: "/pipeline", type: "Page" },
    { title: "Contacts Directory", sub: "All business & client directory", to: "/contacts", type: "Page" },
    { title: "Follow-up Tasks", sub: "High priority follow-ups and todos", to: "/tasks", type: "Page" },
  ];

  const filteredNav = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return NAV_SHORTCUTS.filter(
      (n) => n.title.toLowerCase().includes(q) || n.sub.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <>
      <header className="flex items-center gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5 pr-2 cursor-pointer" onClick={() => navigate("/")}>
          <img src="/logo.png" alt="Nexus CRM" className="h-9 w-9 rounded-xl object-contain shadow-xs" />
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

            <div className="mt-3 space-y-1 max-h-80 overflow-y-auto pr-1">
              {loadingLeads ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2">
                  <Spinner />
                  <p className="text-xs text-ink-soft">Loading leads...</p>
                </div>
              ) : filteredLeads.length === 0 && filteredNav.length === 0 ? (
                <p className="py-8 text-center text-xs text-ink-soft">
                  No leads found matching "{searchQuery}".
                </p>
              ) : (
                <>
                  {filteredLeads.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                        <span>Leads ({filteredLeads.length})</span>
                        <span className="text-[10px] font-normal normal-case">Click to view full lead details</span>
                      </div>
                      <div className="space-y-1">
                        {filteredLeads.map((lead) => {
                          const stageStyle = STAGE_STYLES[lead.status] || STAGE_STYLES.New;
                          return (
                            <button
                              key={lead._id || lead.id}
                              type="button"
                              onClick={() => {
                                setSearchOpen(false);
                                setSearchQuery("");
                                navigate(`/leads?leadId=${lead._id || lead.id}`);
                              }}
                              className="group flex w-full items-center justify-between rounded-xl p-2.5 text-left transition hover:bg-surface-muted cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <Avatar name={lead.name} size="sm" />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-xs text-ink truncate group-hover:text-brand-700">
                                      {lead.name}
                                    </p>
                                    {lead.company && (
                                      <span className="text-[11px] text-ink-soft truncate">
                                        · {lead.company}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-ink-soft truncate">
                                    {lead.email || lead.phone || "No contact info"} · <span className="font-semibold text-ink">{currency(lead.value)}</span>
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge className={stageStyle.badge} dot={stageStyle.dot}>
                                  {lead.status}
                                </Badge>
                                <ArrowRight className="h-3.5 w-3.5 text-ink-soft opacity-0 transition group-hover:opacity-100 group-hover:translate-x-0.5" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {filteredNav.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-line">
                      <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                        Quick Views
                      </p>
                      {filteredNav.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery("");
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
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
