import React, { useState, useMemo } from "react";
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
  godowns,
  belts,
  alerts,
  recentEvents,
} from "./data/mockData";
import { login } from "./services/api";

const ADMIN_EMAIL = "admin@sugarmill.local";
const ADMIN_PASSWORD = "Admin@123";

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
  const [authenticated, setAuthenticated] = useState(false);
  const [page, setPage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    Dashboard: <Dashboard filter={appliedFilter} />,
    Godowns: <Godowns />,
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
            onChange={(e) => setTimeRange(e.target.value)}
          >
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

          <button className="apply-filter-btn" onClick={applyFilter}>
            Apply Filter
          </button>

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
            <div className="system-status">
              <span className="status-dot"></span> System Online
            </div>
            <div className="date-chip">{displayDate}</div>
            <div className="avatar">A</div>
          </div>
        </header>
        <section className="content">{pages[page]}</section>
      </main>
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

function Dashboard({ filter }){
  const running = useMemo(
    () => belts.filter((b) => b.status === "Running").length,
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
          <RefreshCw size={16}/> Refresh
        </button>
      </div>

      <div className="stats-grid">
        <StatCard
          icon={Package}
          label="Total Bags Today"
          value={mockSummary.totalBags.toLocaleString()}
          sub="Across all godowns"
          trend="+8.4%"
        />
        <StatCard
          icon={Gauge}
          label="Current Production Rate"
          value={`${mockSummary.rate.toLocaleString()}/hr`}
          sub={`${mockSummary.perMinute} bags/min`}
          trend="+5.2%"
        />
        <StatCard
          icon={TrendingUp}
          label="Target Achievement"
          value={`${mockSummary.achievement}%`}
          sub={`${mockSummary.target.toLocaleString()} target bags`}
        />
        <StatCard
          icon={Activity}
          label="Active Belts"
          value={`${running}/${belts.length}`}
          sub="Conveyor status"
        />
      </div>

      <div className="grid-2">
        <Panel title="Hourly Production" subtitle="Bags counted by hour">
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyProduction}>
                <defs>
                  <linearGradient
                    id="productionFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopOpacity={0.25} />
                    <stop offset="100%" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="bags"
                  strokeWidth={2.5}
                  fill="url(#productionFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Godown Production" subtitle="Today's bag count">
          <div className="godown-list">
            {godowns.map((g) => (
              <div className="godown-row" key={g.id}>
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
                <div className="progress">
                  <span style={{ width: `${g.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid-2">
        <Panel
          title="Conveyor Belt Status"
          subtitle="Current operating condition"
        >
          <div className="belt-table">
            {belts.slice(0, 6).map((b) => (
              <BeltRow key={b.id} belt={b} />
            ))}
          </div>
        </Panel>
        <Panel title="Recent Counting Events" subtitle="Latest detected bags">
          <div className="events">
            {recentEvents.map((e) => (
              <div className="event-row" key={e.id}>
                <div className="event-icon">
                  <Package size={16} />
                </div>
                <div>
                  <strong>{e.bag}</strong>
                  <small>{e.location}</small>
                </div>
                <span className="event-time">
                  <Clock3 size={13} /> {e.time}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

function Godowns() {
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
          <div className="large-godown" key={g.id}>
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

function Production() {
  const daily = [
    { day: "07 Aug", bags: 21450 },
    { day: "08 Aug", bags: 23120 },
    { day: "09 Aug", bags: 22880 },
    { day: "10 Aug", bags: 24220 },
    { day: "11 Aug", bags: 23840 },
    { day: "12 Aug", bags: mockSummary.totalBags },
  ];
  return (
    <>
      <div className="page-heading">
        <div>
          <h2>Production Analytics</h2>
          <p>Track production trends and target performance.</p>
        </div>
        <select className="filter">
          <option>Today</option>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
        </select>
      </div>
      <Panel title="Daily Production" subtitle="Historical bag count">
        <div className="chart-wrap tall">
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bags" name="Bags" radius={[5, 5, 0, 0]} />
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
                {b.status === "Running" ? "Operational" : "Needs attention"}
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
  return (
    <span className={`status ${status === "Running" ? "running" : "stopped"}`}>
      <span /> {status}
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

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
