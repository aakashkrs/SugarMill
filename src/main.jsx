import React, { useState, useMemo, useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  LayoutDashboard,
  Warehouse,
  Factory,
  Activity,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  TrendingUp,
  Package,
  Gauge,
  Camera,
  ChevronRight,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  CircleOff,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertCircle,
  Hourglass,
  Play,
  XCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import "./styles.css";
import {
  mockSummary,
  hourlyProduction,
  yesterdayProduction,
  dailyProduction,
  allTimeProduction,
  godowns,
  belts,
  cameras,
  alerts,
  recentEvents,
  anomalies,
  peakHour,
  downtime,
} from "./data/mockData";
import { login } from "./services/api";

const ADMIN_EMAIL = "admin@sugarmill.local";
const ADMIN_PASSWORD = "Admin@123";

function getTimeRangeDefaults(range) {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const current = `${hh}:${mm}`;

  switch (range) {
    case "last-1-hour": {
      const d = new Date(now.getTime() - 60 * 60 * 1000);
      return {
        from: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
        to: current,
      };
    }
    case "last-3-hours": {
      const d = new Date(now.getTime() - 3 * 60 * 60 * 1000);
      return {
        from: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
        to: current,
      };
    }
    case "last-6-hours": {
      const d = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      return {
        from: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
        to: current,
      };
    }
    case "whole-day":
      return { from: "00:00", to: "23:59" };
    case "custom":
      return { from: "00:00", to: "23:59" };
    default:
      return { from: "00:00", to: "23:59" };
  }
}

function App() {
  const [filterDate, setFilterDate] = useState("2026-08-12");
  const [timeRange, setTimeRange] = useState("whole-day");
  const [fromTime, setFromTime] = useState("00:00");
  const [toTime, setToTime] = useState("23:59");
  const [appliedFilter, setAppliedFilter] = useState(null);

  const applyFilter = () => {
    setAppliedFilter({
      date: filterDate,
      timeRange,
      from: timeRange === "custom" ? fromTime : "00:00",
      to: timeRange === "custom" ? toTime : "23:59",
    });
  };

  const clearFilter = () => {
    setFilterDate("2026-08-12");
    setTimeRange("whole-day");
    setFromTime("00:00");
    setToTime("23:59");
    setAppliedFilter(null);
  };

  const handleTimeRangeChange = (e) => {
    const range = e.target.value;
    setTimeRange(range);
    if (range !== "custom") {
      const times = getTimeRangeDefaults(range);
      setFromTime(times.from);
      setToTime(times.to);
      setAppliedFilter({
        date: filterDate,
        timeRange: range,
        from: times.from,
        to: times.to,
      });
    }
  };

  const [authenticated, setAuthenticated] = useState(false);
  const [page, setPage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedGodown, setSelectedGodown] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  function ThemeToggle() {
    return (
      <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </button>
    );
  }

  const displayDate = useMemo(() => {
    if (appliedFilter) return appliedFilter.date;
    const today = new Date();
    return today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [appliedFilter]);

  if (!authenticated) {
    return <Login onLogin={() => setAuthenticated(true)} />;
  }

  const logout = () => setAuthenticated(false);

  const pages = {
    Dashboard: <Dashboard filter={appliedFilter} onGodownClick={setSelectedGodown} />,
    Godowns: <Godowns onGodownClick={setSelectedGodown} />,
    Production: <Production />,
    Belts: <Belts />,
    Alerts: <Alerts />,
    Settings: <SettingsPage />,
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">SM</div>
          <div>
            <strong>Sugar Mill</strong>
            <span>Production Control</span>
          </div>
          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav>
          {[
            ["Dashboard", LayoutDashboard],
            ["Godowns", Warehouse],
            ["Production", Factory],
            ["Belts", Activity],
            ["Alerts", Bell],
            ["Settings", Settings],
          ].map(([name, Icon]) => (
            <button
              key={name}
              className={`nav-item ${page === name ? "active" : ""}`}
              onClick={() => {
                setPage(name);
                setSidebarOpen(false);
              }}
            >
              <Icon size={19} />
              <span>{name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-filter">
          <div className="filter-title">
            <span>DATA FILTER</span>
          </div>

          <label>Date</label>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />

          <label>Time Range</label>

          <select
            value={timeRange}
            onChange={handleTimeRangeChange}
          >
            <option value="last-1-hour">Last 1 Hour</option>
            <option value="last-3-hours">Last 3 Hours</option>
            <option value="last-6-hours">Last 6 Hours</option>
            <option value="whole-day">Whole Day</option>
            <option value="custom">Custom Time</option>
          </select>

          {timeRange === "custom" && (
            <>
              <label>From</label>
              <input
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
              />
              <label>To</label>
              <input
                type="time"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
              />
            </>
          )}

          {timeRange === "custom" && (
            <button className="apply-filter-btn" onClick={applyFilter}>
              Apply Filter
            </button>
          )}

          <button className="clear-filter-btn" onClick={clearFilter}>
            Clear
          </button>
        </div>

        <div className="sidebar-bottom">
          <div className="admin-badge">
            <ShieldCheck size={18} />
            <div>
              <strong>Admin Access</strong>
              <small>Authorized user</small>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div>
            <h1>{page}</h1>
            <p>Live sugar mill production monitoring</p>
          </div>
          <div className="topbar-right">
            <ThemeToggle />
            <div className="system-status">
              <span className="status-dot"></span> System Online
            </div>
            <div className="date-chip">{displayDate}</div>
            <div className="avatar">A</div>
          </div>
        </header>
        <section className="content">{pages[page]}</section>
      </main>

      {selectedGodown && (
        <GodownModal godown={selectedGodown} onClose={() => setSelectedGodown(null)} />
      )}
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) onLogin();
    else setError("Invalid admin email or password.");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">SM</div>
        <div className="login-title">Sugar Mill</div>
        <p className="login-subtitle">Bag Counting & Production Monitoring</p>
        <form onSubmit={submit}>
          <label>Admin Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@sugarmill.local"
            type="email"
          />
          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            type="password"
          />
          {error && <div className="error-box">{error}</div>}
          <button className="primary-btn" type="submit">
            Sign in to Dashboard <ChevronRight size={18} />
          </button>
        </form>
        <div className="demo-credentials">
          <strong>Demo credentials</strong>
          <span>{ADMIN_EMAIL}</span>
          <span>{ADMIN_PASSWORD}</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className="stat-icon">
          <Icon size={20} />
        </div>
        {trend && <span className="trend">{trend}</span>}
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

function Dashboard({ filter, onGodownClick }) {
  const running = useMemo(
    () => belts.filter((b) => b.status === "Running").length,
    []
  );
  const slow = useMemo(
    () => belts.filter((b) => b.status === "Slow").length,
    []
  );
  const stopped = useMemo(
    () => belts.filter((b) => b.status === "Stopped").length,
    []
  );
  const onlineCameras = useMemo(
    () => cameras.filter((c) => c.status === "Online").length,
    []
  );

  const mergedHourly = useMemo(
    () =>
      hourlyProduction.map((h, i) => ({
        hour: h.hour,
        today: h.bags,
        yesterday: yesterdayProduction[i]?.bags || 0,
      })),
    []
  );

  const maxBags = useMemo(
    () => Math.max(...hourlyProduction.map((h) => h.bags)),
    []
  );

  return (
    <>
      {filter && (
        <div className="active-filter">
          <span>
            Date: <strong>{filter.date}</strong>
          </span>
          <span>
            Time: <strong>{filter.from} - {filter.to}</strong>
          </span>
        </div>
      )}

      <div className="page-heading">
        <div>
          <h2>Factory Overview</h2>
          <p>Monitor bag counting, production and conveyor performance.</p>
        </div>
        <button className="secondary-btn">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="kpi-grid">
        <StatCard
          icon={Package}
          label="Total Bags"
          value={mockSummary.totalBags.toLocaleString()}
          sub="Across all godowns"
        />
        <StatCard
          icon={Gauge}
          label="Bags / Hour"
          value={`${mockSummary.rate.toLocaleString()}`}
          sub={`${mockSummary.perMinute} bags/min`}
        />
        <StatCard
          icon={Clock3}
          label="Peak Hour"
          value={peakHour.hour}
          sub={`${peakHour.bags.toLocaleString()} bags`}
        />
        <StatCard
          icon={Activity}
          label="Active Belts"
          value={`${running}/${belts.length}`}
          sub={`${slow} slow · ${stopped} stopped`}
        />
        <StatCard
          icon={CircleOff}
          label="Downtime"
          value={`${downtime.today} min`}
          sub={`vs ${downtime.yesterday} min yesterday`}
        />
      </div>

      <div className="grid-2">
        <Panel title="Hourly Production" subtitle="Today vs Yesterday comparison">
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mergedHourly}>
                <defs>
                  <linearGradient id="todayFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopOpacity={0.3} />
                    <stop offset="100%" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="yesterdayFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopOpacity={0.15} />
                    <stop offset="100%" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="today"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fill="url(#todayFill)"
                  name="Today"
                />
                <Area
                  type="monotone"
                  dataKey="yesterday"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  fill="url(#yesterdayFill)"
                  name="Yesterday"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Godown Production" subtitle="Click a row for details">
          <div className="godown-list">
            {godowns.map((g) => {
              const pct = Math.min(100, Math.round((g.bags / g.target) * 100));
              return (
                <div
                  className="godown-row clickable"
                  key={g.id}
                  onClick={() => onGodownClick(g)}
                >
                  <div className="godown-name">
                    <div className="mini-icon">
                      <Warehouse size={17} />
                    </div>
                    <div>
                      <strong>{g.name}</strong>
                      <small>{g.belts} conveyor belts</small>
                    </div>
                  </div>
                  <div className="godown-count">
                    {g.bags.toLocaleString()} <small>bags</small>
                  </div>
                  <div className="godown-pct">{pct}%</div>
                  <div className="progress">
                    <span style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="grid-2">
        <Panel title="Live Belt Status" subtitle="Current operating condition">
          <div className="live-belts">
            {belts.map((b) => (
              <div className="live-belt-row" key={b.id}>
                <div className="live-belt-main">
                  <strong>{b.id}</strong>
                  <span>{b.name}</span>
                </div>
                <Status status={b.status} />
                <div className="live-belt-bags">
                  {b.bags.toLocaleString()} <small>bags</small>
                </div>
                <div className="live-belt-rate">{b.rate}/hr</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Camera / Counting Health" subtitle="System online status">
          <div className="camera-grid">
            {cameras.map((c) => (
              <CameraCard key={c.id} camera={c} />
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid-2">
        <Panel title="Alerts & Anomalies" subtitle="Belt stoppage, production, camera issues">
          <div className="anomaly-list">
            {anomalies.slice(0, 4).map((a) => (
              <AnomalyCard key={a.id} anomaly={a} />
            ))}
          </div>
        </Panel>

        <Panel title="Peak Production Hour" subtitle="Best performing hour today">
          <div className="peak-hour-card">
            <div className="peak-hour-icon">
              <TrendingUp size={28} />
            </div>
            <div className="peak-hour-info">
              <div className="peak-hour-value">{peakHour.hour}</div>
              <div className="peak-hour-label">Peak Hour</div>
              <div className="peak-hour-bags">{peakHour.bags.toLocaleString()} bags counted</div>
            </div>
            <div className="peak-hour-chart">
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={hourlyProduction}>
                  <defs>
                    <linearGradient id="peakFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopOpacity={0.2} />
                      <stop offset="100%" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="hour" tick={{fontSize: 10}} />
                  <YAxis hide />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="bags"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fill="url(#peakFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}

function Godowns({ onGodownClick }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <h2>Godown Monitoring</h2>
          <p>Production performance by storage area.</p>
        </div>
      </div>
      <div className="godown-cards">
        {godowns.map((g) => (
          <div
            className="large-godown clickable"
            key={g.id}
            onClick={() => onGodownClick(g)}
          >
            <div className="large-godown-head">
              <div className="warehouse-symbol">
                <Warehouse size={25} />
              </div>
              <div>
                <h3>{g.name}</h3>
                <span>{g.belts} conveyor belts</span>
              </div>
              <span className="live-pill">LIVE</span>
            </div>
            <div className="large-number">
              {g.bags.toLocaleString()} <small>bags today</small>
            </div>
            <div className="godown-metrics">
              <div>
                <span>Rate</span>
                <strong>{g.rate}/hr</strong>
              </div>
              <div>
                <span>Target</span>
                <strong>{g.target.toLocaleString()}</strong>
              </div>
              <div>
                <span>Achievement</span>
                <strong>{Math.round((g.bags / g.target) * 100)}%</strong>
              </div>
            </div>
            <div className="progress large">
              <span
                style={{
                  width: `${Math.min(100, (g.bags / g.target) * 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function GodownModal({ godown, onClose }) {
  if (!godown) return null;
  const pct = Math.min(100, Math.round((godown.bags / godown.target) * 100));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">
            <Warehouse size={22} />
            <h3>{godown.name}</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-metric">
            <span>Total Bags</span>
            <strong>{godown.bags.toLocaleString()}</strong>
          </div>
          <div className="modal-metric">
            <span>Target</span>
            <strong>{godown.target.toLocaleString()}</strong>
          </div>
          <div className="modal-metric">
            <span>Achievement</span>
            <strong>{pct}%</strong>
          </div>
          <div className="modal-metric">
            <span>Rate</span>
            <strong>{godown.rate}/hr</strong>
          </div>
          <div className="modal-metric">
            <span>Conveyor Belts</span>
            <strong>{godown.belts}</strong>
          </div>
          <div className="progress large modal-progress">
            <span style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Production() {
  const [view, setView] = useState("daily");

  const getChartData = () => {
    switch (view) {
      case "hourly":
        return hourlyProduction.map((h) => ({ hour: h.hour, bags: h.bags }));
      case "all-time":
        return allTimeProduction;
      default:
        return dailyProduction;
    }
  };

  const getXKey = () => (view === "hourly" ? "hour" : "day");

  return (
    <>
      <div className="page-heading">
        <div>
          <h2>Production Analytics</h2>
          <p>Track production trends and target performance.</p>
        </div>
        <div className="view-tabs">
          <button
            className={`view-tab ${view === "daily" ? "active" : ""}`}
            onClick={() => setView("daily")}
          >
            Daily
          </button>
          <button
            className={`view-tab ${view === "hourly" ? "active" : ""}`}
            onClick={() => setView("hourly")}
          >
            Hourly
          </button>
          <button
            className={`view-tab ${view === "all-time" ? "active" : ""}`}
            onClick={() => setView("all-time")}
          >
            All-Time
          </button>
        </div>
      </div>
      <Panel title="Production Trend" subtitle="Historical bag count">
        <div className="chart-wrap tall">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={getChartData()}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={getXKey()} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bags" name="Bags" radius={[5, 5, 0, 0]} fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
      <div className="stats-grid compact">
        <StatCard
          icon={Package}
          label="Today's Production"
          value={mockSummary.totalBags.toLocaleString()}
          sub="bags"
        />
        <StatCard
          icon={TrendingUp}
          label="Average Daily"
          value="23,555"
          sub="bags/day"
        />
        <StatCard
          icon={Gauge}
          label="Peak Rate"
          value="1,420/hr"
          sub="recorded today"
        />
        <StatCard
          icon={Factory}
          label="Best Godown"
          value="Godown 3"
          sub="8,480 bags"
        />
      </div>
    </>
  );
}

function Belts() {
  return (
    <>
      <div className="page-heading">
        <div>
          <h2>Conveyor Belt Monitoring</h2>
          <p>Monitor each belt and its counting camera.</p>
        </div>
      </div>
      <div className="belt-grid">
        {belts.map((b) => (
          <div className="belt-card" key={b.id}>
            <div className="belt-head">
              <div>
                <span className="belt-id">{b.id}</span>
                <h3>{b.name}</h3>
              </div>
              <Status status={b.status} />
            </div>
            <div className="belt-count">
              {b.bags.toLocaleString()} <small>bags today</small>
            </div>
            <div className="belt-info">
              <span>
                <Gauge size={15} /> {b.rate}/hr
              </span>
              <span>
                <Camera size={15} /> {b.camera}
              </span>
            </div>
            <div className="belt-footer">
              <span>Last event {b.lastEvent}</span>
              <span className={b.status === "Running" ? "green" : "red"}>
                {b.status === "Running" ? "Operational" : b.status === "Slow" ? "Slow" : "Needs attention"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Alerts() {
  return (
    <>
      <div className="page-heading">
        <div>
          <h2>Alerts & Events</h2>
          <p>Operational alerts generated by the monitoring system.</p>
        </div>
      </div>
      <div className="alert-summary">
        <div>
          <strong>{alerts.filter((a) => a.level === "warning").length}</strong>
          <span>Warnings</span>
        </div>
        <div>
          <strong>{alerts.filter((a) => a.level === "critical").length}</strong>
          <span>Critical</span>
        </div>
        <div>
          <strong>{alerts.filter((a) => a.level === "resolved").length}</strong>
          <span>Resolved</span>
        </div>
      </div>
      <div className="alert-list">
        {alerts.map((a) => (
          <div className={`alert-card ${a.level}`} key={a.id}>
            <div className="alert-icon">
              {a.level === "critical" ? (
                <AlertTriangle size={20} />
              ) : a.level === "resolved" ? (
                <CheckCircle2 size={20} />
              ) : (
                <Bell size={20} />
              )}
            </div>
            <div className="alert-content">
              <strong>{a.title}</strong>
              <p>{a.description}</p>
              <small>
                {a.time} • {a.location}
              </small>
            </div>
            <span className="alert-level">{a.level}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function SettingsPage() {
  return (
    <div className="settings-page">
      <div className="page-heading">
        <div>
          <h2>System Settings</h2>
          <p>Frontend demo configuration.</p>
        </div>
      </div>
      <Panel
        title="API Integration"
        subtitle="This frontend is currently using mock data."
      >
        <div className="settings-box">
          <div>
            <strong>Data source</strong>
            <span>Mock data</span>
          </div>
          <div>
            <strong>Backend API</strong>
            <span>Not connected</span>
          </div>
          <div>
            <strong>Database</strong>
            <span>Supabase — to be connected later</span>
          </div>
          <div>
            <strong>Authentication</strong>
            <span>Demo client-side login</span>
          </div>
        </div>
      </Panel>
      <div className="notice">
        <ShieldCheck size={19} />
        <div>
          <strong>Production security note</strong>
          <p>
            For the real deployment, move authentication to Supabase
            Auth/backend authorization. Never keep real passwords in frontend
            JavaScript.
          </p>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Status({ status }) {
  const cls = status === "Running" ? "running" : status === "Slow" ? "slow" : "stopped";
  const icon = status === "Running" ? <Play size={12} /> : status === "Slow" ? <Hourglass size={12} /> : <XCircle size={12} />;
  return (
    <span className={`status ${cls}`}>
      <span>{icon}</span> {status}
    </span>
  );
}

function BeltRow({ belt }) {
  return (
    <div className="belt-row">
      <div>
        <strong>{belt.id}</strong>
        <span>{belt.name}</span>
      </div>
      <Status status={belt.status} />
      <strong>{belt.bags.toLocaleString()}</strong>
      <span>{belt.rate}/hr</span>
    </div>
  );
}

function CameraCard({ camera }) {
  const statusMap = {
    Online: { icon: Wifi, color: "success" },
    Warning: { icon: AlertCircle, color: "warning" },
    Offline: { icon: WifiOff, color: "danger" },
  };
  const { icon: Icon, color } = statusMap[camera.status] || statusMap.Offline;

  return (
    <div className={`camera-card ${color}`}>
      <div className="camera-card-icon">
        <Icon size={18} />
      </div>
      <div className="camera-card-info">
        <strong>{camera.id}</strong>
        <span>Belt {camera.belt}</span>
      </div>
      <div className="camera-card-status">{camera.status}</div>
      {camera.note && <div className="camera-card-note">{camera.note}</div>}
    </div>
  );
}

function AnomalyCard({ anomaly }) {
  const iconMap = {
    belt: AlertTriangle,
    production: TrendingUp,
    camera: Camera,
  };
  const Icon = iconMap[anomaly.type] || AlertTriangle;
  return (
    <div className={`anomaly-card ${anomaly.level}`}>
      <div className={`anomaly-icon ${anomaly.level}`}>
        <Icon size={18} />
      </div>
      <div className="anomaly-content">
        <strong>{anomaly.title}</strong>
        <p>{anomaly.description}</p>
        <small>{anomaly.time}</small>
      </div>
      <span className={`anomaly-badge ${anomaly.level}`}>{anomaly.level}</span>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
