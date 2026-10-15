import React, { useState, useMemo, useEffect, useRef } from "react";
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
  Sprout,
  UserRound,
  LockKeyhole,
  UsersRound,
  CircleDollarSign,
  FileText,
  LogIn,
  Wheat,
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
import { emptyDashboard } from "./data/emptyDashboard";
import { getDashboardSummary, login } from "./services/api";

const ADMIN_EMAIL = "admin@sugarmill.local";
const ADMIN_PASSWORD = "Admin@123";

function localDateInputValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

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
  const [filterDate, setFilterDate] = useState(localDateInputValue);
  const [timeRange, setTimeRange] = useState("whole-day");
  const [fromTime, setFromTime] = useState("00:00");
  const [toTime, setToTime] = useState("23:59");
  const [appliedFilter, setAppliedFilter] = useState(null);

  const applyFilter = () => {
    const range = timeRange === "custom"
      ? { from: fromTime, to: toTime }
      : getTimeRangeDefaults(timeRange);
    setAppliedFilter({
      date: filterDate,
      timeRange,
      from: range.from,
      to: range.to,
    });
  };

  const clearFilter = () => {
    setFilterDate(localDateInputValue());
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
  const [dashboardData, setDashboardData] = useState(emptyDashboard);
  const [dashboardError, setDashboardError] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await getDashboardSummary(appliedFilter);
        if (active) {
          setDashboardData({ ...emptyDashboard, ...data });
          setDashboardError("");
        }
      } catch (error) {
        if (active) setDashboardError(error.message || "Dashboard API unavailable");
      }
    };
    load();
    const timer = window.setInterval(load, 2000);
    return () => { active = false; window.clearInterval(timer); };
  }, [refreshToken, appliedFilter]);

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
    Dashboard: <Dashboard data={dashboardData} dataError={dashboardError} filter={appliedFilter} onRefresh={() => setRefreshToken((v) => v + 1)} onGodownClick={setSelectedGodown} />,
    Godowns: <Godowns data={dashboardData} onGodownClick={setSelectedGodown} />,
    Production: <Production data={dashboardData} />,
    Belts: <Belts data={dashboardData} />,
    Alerts: <Alerts data={dashboardData} />,
    Settings: <SettingsPage apiError={dashboardError} apiReady={Boolean(dashboardData.generatedAt)} />,
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
              <span className={`status-dot ${dashboardData.cameraStatus?.connected ? "" : "offline"}`}></span>
              {dashboardData.cameraStatus?.connected ? "Camera Online" : "Camera Offline"}
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
  const [captcha, setCaptcha] = useState(() => makeCaptcha());
  const [captchaEntry, setCaptchaEntry] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (captchaEntry.trim().toUpperCase() !== captcha) {
      setError("Security code does not match. Please try again.");
      setCaptcha(makeCaptcha());
      setCaptchaEntry("");
      return;
    }
    const result = await login(email, password);
    if (result.success) onLogin();
    else {
      setError("Invalid admin email or password.");
      setCaptcha(makeCaptcha());
      setCaptchaEntry("");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <section className="login-brand-panel">
          <Sprout className="login-decor decor-sprout" size={54} />
          <Wheat className="login-decor decor-wheat" size={54} />
          <span className="login-orb orb-one" /><span className="login-orb orb-two" />
          <div className="brand-content">
            <Factory className="login-factory" size={54} fill="currentColor" />
            <h1>Sugar Mill</h1>
            <p>Bag Counting &amp; Production<br />Monitoring System</p>
            <ul>
              <li><UsersRound size={21} /> Grower Management</li>
              <li><TrendingUp size={21} /> Production Tracking</li>
              <li><CircleDollarSign size={21} /> Payment Processing</li>
              <li><FileText size={21} /> Detailed Reports</li>
            </ul>
          </div>
        </section>
        <section className="login-form-panel">
          <header className="login-heading">
            <h2><Sprout size={34} fill="currentColor" /> Welcome Back</h2>
            <p>Sign in to your account</p>
          </header>
          <form onSubmit={submit}>
            <label className="sr-only" htmlFor="login-email">Email</label>
            <div className="login-input-row">
              <span><UserRound size={19} /></span>
              <input id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" type="email" autoComplete="username" required />
            </div>
            <label className="sr-only" htmlFor="login-password">Password</label>
            <div className="login-input-row">
              <span><LockKeyhole size={18} /></span>
              <input id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" autoComplete="current-password" required />
            </div>
            <label className="captcha-label" htmlFor="captcha-entry">Captcha Code</label>
            <div className="captcha-row">
              <div className="captcha-art" aria-label={`Captcha: ${captcha}`}>{captcha.split("").map((char, i) => <span key={i}>{char}</span>)}</div>
              <button className="captcha-refresh" type="button" aria-label="Refresh captcha" onClick={() => { setCaptcha(makeCaptcha()); setCaptchaEntry(""); }}><RefreshCw size={20} /></button>
              <input id="captcha-entry" className="captcha-entry" value={captchaEntry} onChange={(e) => setCaptchaEntry(e.target.value)} placeholder="SECURITY CODE*" autoComplete="off" required />
            </div>
            {error && <div className="error-box" role="alert">{error}</div>}
            <label className="remember-row"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> Remember me</label>
            <button className="primary-btn" type="submit"><LogIn size={20} /> Sign In</button>
          </form>
          <div className="login-footer">Demo: {ADMIN_EMAIL} · {ADMIN_PASSWORD}</div>
        </section>
      </div>
    </div>
  );
}

function makeCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
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

function LiveCameraPanel() {
  const [rtspUrl, setRtspUrl] = useState("");
  const [cameraStatus, setCameraStatus] = useState({ connected: false, count: 0, fps: 0, detections: 0, error: "" });
  const [streamKey, setStreamKey] = useState(0);
  const [line, setLine] = useState(null);
  const [draftLine, setDraftLine] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [message, setMessage] = useState("");
  const imageRef = useRef(null);
  const draftLineRef = useRef(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/status");
        const data = await response.json();
        if (!active) return;
        setCameraStatus(data);
        setLine(Array.isArray(data.line) ? data.line : null);
        if (data.state === "connecting" || data.state === "loading_model") {
          setMessage(data.error || "Connecting to camera...");
        } else if (data.state === "error") {
          setMessage(data.error || "Camera connection failed.");
        } else if (data.state === "live") {
          setMessage((previous) => previous.startsWith("Connecting") || previous.startsWith("Camera connected;") ? "" : previous);
        }
      } catch {
        if (active) {
          setCameraStatus((prev) => ({ ...prev, connected: false, state: "error", error: "Detection service is not running" }));
          setMessage("Detection service is not running. Start the backend API and try again.");
        }
      }
    };
    refresh();
    const timer = window.setInterval(refresh, 1000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const connect = async (e) => {
    e.preventDefault();
    setMessage("Connecting to camera...");
    try {
      const response = await fetch("/api/camera/connect", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rtsp_url: rtspUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not connect to camera");
      setMessage("Connecting to camera...");
      setStreamKey((key) => key + 1);
    } catch (error) { setMessage(error.message); }
  };

  const disconnect = async () => {
    await fetch("/api/camera/disconnect", { method: "POST" }).catch(() => {});
    drawingRef.current = false;
    draftLineRef.current = null;
    setDrawing(false);
    setDraftLine(null);
    setCameraStatus((prev) => ({ ...prev, connected: false, state: "disconnected" }));
    setMessage("");
  };

  const pointFromEvent = (event, clamp = false) => {
    const image = imageRef.current;
    if (!image || !image.naturalWidth || !image.naturalHeight) return null;
    const rect = image.getBoundingClientRect();
    const scale = Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const left = rect.left + (rect.width - width) / 2;
    const top = rect.top + (rect.height - height) / 2;
    let x = (event.clientX - left) / width;
    let y = (event.clientY - top) / height;
    if (!clamp && (x < 0 || x > 1 || y < 0 || y > 1)) return null;
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));
    return [x, y];
  };
  const beginLine = (event) => {
    if (!drawingRef.current) return;
    const point = pointFromEvent(event);
    if (!point) return;
    const [x, y] = point;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const draft = [x, y, x, y];
    draftLineRef.current = draft;
    setDraftLine(draft);
  };
  const moveLine = (event) => {
    if (!draftLineRef.current) return;
    const point = pointFromEvent(event, true);
    if (!point) return;
    const draft = [draftLineRef.current[0], draftLineRef.current[1], point[0], point[1]];
    draftLineRef.current = draft;
    setDraftLine(draft);
  };
  const finishLine = async (event) => {
    const draft = draftLineRef.current;
    if (!draft) return;
    const point = pointFromEvent(event, true);
    if (!point) return;
    const nextLine = [draft[0], draft[1], point[0], point[1]];
    const image = imageRef.current;
    const rect = image?.getBoundingClientRect();
    if (rect && Math.hypot((nextLine[2] - nextLine[0]) * rect.width,
      (nextLine[3] - nextLine[1]) * rect.height) < 12) {
      draftLineRef.current = null;
      setDraftLine(null);
      setMessage("Drag farther across the video to place a counting line.");
      return;
    }
    draftLineRef.current = null;
    setDraftLine(null);
    try {
      const response = await fetch("/api/camera/line", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x1: nextLine[0], y1: nextLine[1], x2: nextLine[2], y2: nextLine[3] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not save counting line");
      setLine(nextLine);
      drawingRef.current = false;
      setDrawing(false);
      setMessage("Counting line saved. Each tracked bag is counted once when it crosses the line.");
    } catch (error) {
      setDrawing(true);
      drawingRef.current = true;
      setMessage(error.message);
    }
  };

  const cancelLine = () => {
    draftLineRef.current = null;
    setDraftLine(null);
    setMessage("Line placement cancelled. Try dragging again.");
  };

  const toggleDrawing = () => {
    const next = !drawingRef.current;
    drawingRef.current = next;
    setDrawing(next);
    draftLineRef.current = null;
    setDraftLine(null);
    setMessage(next ? "Drag from one side of the conveyor to the other." : "Line drawing cancelled.");
  };

  const clearLine = async () => {
    try {
      const response = await fetch("/api/camera/line", { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not clear counting line");
      setLine(null);
      setMessage("Counting line cleared. Counting is paused until you add a new line.");
    } catch (error) { setMessage(error.message); }
  };

  const visibleLine = draftLine || line;
  const feedStarting = cameraStatus.state === "connecting" || cameraStatus.state === "loading_model";
  const statusLabel = cameraStatus.connected ? "LIVE" : feedStarting ? "CONNECTING" : cameraStatus.error ? "OFFLINE" : "DISCONNECTED";
  return (
    <Panel title="Live Camera Feed" subtitle="RTSP camera with YOLO detections and line-crossing count">
      <form className="camera-connect-form" onSubmit={connect}>
        <input aria-label="RTSP camera URL" type="text" autoComplete="off" autoCapitalize="off" spellCheck="false" placeholder="RTSP URL (rtsp://user:password@camera/stream)" value={rtspUrl} onChange={(e) => setRtspUrl(e.target.value)} required />
        {cameraStatus.connected || feedStarting
          ? <button className="secondary-btn" type="button" onClick={disconnect}>Disconnect</button>
          : <button className="primary-btn" type="submit">Connect camera</button>}
        <a className="secondary-btn csv-download" href="/api/events.csv" download>Download CSV</a>
      </form>
      <div className="camera-live-stats">
        <span className={cameraStatus.connected ? "live-status online" : "live-status offline"}><i />{statusLabel}</span>
        <span><strong>{cameraStatus.count || 0}</strong> bags counted</span>
        <span><strong>{cameraStatus.detections || 0}</strong> in frame</span>
        <span><strong>{cameraStatus.fps || 0}</strong> FPS</span>
      </div>
      <div className="camera-line-tools">
        <button className="secondary-btn" type="button" disabled={!cameraStatus.connected} onClick={toggleDrawing}>
          {drawing ? "Cancel drawing" : line ? "Redraw line" : "Add counting line"}
        </button>
        {line && !drawing && <button className="text-button" type="button" onClick={clearLine}>Clear line</button>}
        <span>{drawing ? "Drag across the feed to place your counting line." : line ? "Line is active; bags crossing it are counted once." : "No line set. Counting is paused."}</span>
      </div>
      <div className={`camera-feed-frame ${drawing ? "drawing-line" : ""}`}>
        {cameraStatus.connected || feedStarting
          ? <div className="camera-video-canvas" onPointerDown={cameraStatus.connected && drawing ? beginLine : undefined} onPointerMove={moveLine} onPointerUp={finishLine} onPointerCancel={cancelLine}>
              <img ref={imageRef} key={streamKey} draggable="false" src={`/api/camera/stream.mjpg?session=${streamKey}`} alt="Live RTSP stream with model detections" onError={() => setMessage("Live video stream failed. Check the backend status and camera connection.")} />
              {visibleLine && <svg className={`counting-line-overlay ${draftLine ? "preview" : ""}`} viewBox="0 0 1 1" preserveAspectRatio="none"><line x1={visibleLine[0]} y1={visibleLine[1]} x2={visibleLine[2]} y2={visibleLine[3]} /></svg>}
            </div>
          : <div className="camera-feed-empty"><Camera size={36} /><strong>Camera feed will appear here</strong><span>Enter the RTSP URL and connect to start live detection.</span></div>}
        <span className={`feed-live-badge ${cameraStatus.connected ? "on" : ""}`}><i />{statusLabel}</span>
      </div>
      <div className="camera-feed-footer"><span>Enable “Add counting line”, then drag on the video.</span><span>Counts are saved to CSV after a tracked bag crosses your line.</span></div>
      {(message || cameraStatus.error) && <p className="camera-feed-message">{message || cameraStatus.error}</p>}
    </Panel>
  );
}

function Dashboard({ data, dataError, filter, onRefresh, onGodownClick }) {
  const { summary, hourlyProduction, yesterdayProduction, godowns, belts, cameras, anomalies, recentEvents, peakHour, downtime } = data;
  const selectedDateLabel = new Date(`${data.focusDate || filter?.date || localDateInputValue()}T00:00:00`).toLocaleDateString("en", { month: "short", day: "numeric" });
  const onlineCameras = useMemo(
    () => cameras.filter((c) => c.status === "Online").length,
    [cameras]
  );

  const mergedHourly = useMemo(
    () =>
      hourlyProduction.map((h, i) => ({
        hour: h.hour,
        today: h.bags,
        yesterday: yesterdayProduction[i]?.bags || 0,
      })),
    [hourlyProduction, yesterdayProduction]
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
        <button className="secondary-btn" onClick={onRefresh}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {dataError && <div className="empty-data-state" role="alert">Live dashboard data is unavailable: {dataError}. Start the Python API to load CSV records.</div>}

      <div className="dashboard-live-camera"><LiveCameraPanel /></div>

      <div className="kpi-grid">
        <StatCard
          icon={Package}
          label="Bags in Selected Period"
          value={summary.totalBags.toLocaleString()}
          sub={`${summary.allTimeBags.toLocaleString()} recorded all time`}
        />
        <StatCard
          icon={Gauge}
          label="Bags / Hour"
          value={`${summary.rate.toLocaleString()}`}
          sub={summary.rateLabel || `${summary.perMinute} crossed in the last minute`}
        />
        <StatCard
          icon={Clock3}
          label="Peak Hour"
          value={peakHour.hour}
          sub={`${peakHour.bags.toLocaleString()} bags`}
        />
        <StatCard
          icon={Activity}
          label="Camera Sources Online"
          value={`${onlineCameras}/${cameras.length}`}
          sub={cameras.length ? "Live camera status" : "No camera configured"}
        />
        <StatCard
          icon={CircleOff}
          label="Downtime"
          value={downtime.today == null ? "—" : `${downtime.today} min`}
          sub={downtime.today == null ? "No downtime history in CSV yet" : "Recorded for the selected date"}
        />
      </div>

      <div className="grid-2">
        <Panel title="Hourly Production" subtitle={`Camera crossing counts from CSV; compare ${selectedDateLabel} with the previous day`}>
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
                  name={selectedDateLabel}
                />
                <Area
                  type="monotone"
                  dataKey="yesterday"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  fill="url(#yesterdayFill)"
                  name="Previous day"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Godown Production" subtitle="Values appear when a camera is assigned to a godown">
          <div className="godown-list">
            {godowns.length === 0 && <div className="empty-data-state">No godown mapping is configured for this camera.</div>}
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
        <Panel title="Live Camera Source" subtitle="Status and counts recorded from the RTSP input">
          <div className="live-belts">
            {belts.length === 0 && <div className="empty-data-state">No camera events are recorded yet.</div>}
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
            {cameras.length === 0 && <div className="empty-data-state">Connect a camera to show its health.</div>}
            {cameras.map((c) => (
              <CameraCard key={c.id} camera={c} />
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid-2">
        <Panel title="Alerts & Anomalies" subtitle="Camera service events recorded in CSV">
          <div className="anomaly-list">
            {anomalies.length === 0 && <div className="empty-data-state">No camera events have been recorded yet.</div>}
            {anomalies.slice(0, 4).map((a) => (
              <AnomalyCard key={a.id} anomaly={a} />
            ))}
          </div>
        </Panel>

        <Panel title="Peak Production Hour" subtitle={`Calculated from ${selectedDateLabel} recorded bag crossings`}>
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
      <div className="dashboard-recent-events">
        <Panel title="Recent Bag Crossings" subtitle="Latest counted events from camera_events.csv">
          {recentEvents.length === 0
            ? <div className="empty-data-state">No bags have crossed the counting line in this period.</div>
            : <div className="recent-crossing-list">{recentEvents.slice(0, 10).map((event) => (
                <div className="recent-crossing-row" key={event.id}>
                  <strong>{event.bag}</strong><span>{event.location}</span><time>{event.time}</time>
                </div>
              ))}</div>}
        </Panel>
      </div>
    </>
  );
}

function Godowns({ data, onGodownClick }) {
  const { godowns } = data;
  return (
    <>
      <div className="page-heading">
        <div>
          <h2>Godown Monitoring</h2>
          <p>Production performance by storage area.</p>
        </div>
      </div>
      <div className="godown-cards">
        {godowns.length === 0 && <div className="empty-data-state">No camera-to-godown mapping is configured. Live counts are available under the camera source.</div>}
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

function Production({ data }) {
  const { hourlyProduction, dailyProduction, allTimeProduction, summary, cameras } = data;
  const [view, setView] = useState("daily");

  const getChartData = () => {
    switch (view) {
      case "hourly":
        return hourlyProduction;
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
          <p>Production trends calculated from recorded camera crossings.</p>
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
      <Panel title="Production Trend" subtitle="Historical bag crossings stored in CSV">
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
          label="Selected Period Production"
          value={summary.totalBags.toLocaleString()}
          sub="bags"
        />
        <StatCard
          icon={TrendingUp}
          label="Average Recorded Day"
          value={(dailyProduction.length ? Math.round(dailyProduction.reduce((sum, row) => sum + row.bags, 0) / dailyProduction.length) : 0).toLocaleString()}
          sub="bags/day"
        />
        <StatCard
          icon={Gauge}
          label="Peak Rate"
          value={`${Math.max(0, ...hourlyProduction.map((row) => row.bags)).toLocaleString()}/hr`}
          sub="highest recorded hour in selected period"
        />
        <StatCard
          icon={Factory}
          label="Connected Cameras"
          value={`${cameras.filter((camera) => camera.status === "Online").length}/${cameras.length}`}
          sub="real camera status"
        />
      </div>
    </>
  );
}

function Belts({ data }) {
  const { belts } = data;
  return (
    <>
      <div className="page-heading">
        <div>
          <h2>Conveyor Belt Monitoring</h2>
          <p>Camera sources and belt counts recorded in CSV.</p>
        </div>
      </div>
      <div className="belt-grid">
        {belts.length === 0 && <div className="empty-data-state">No camera events are recorded yet.</div>}
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
              {b.bags.toLocaleString()} <small>bags in selected period</small>
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

function Alerts({ data }) {
  const { alerts } = data;
  return (
    <>
      <div className="page-heading">
        <div>
          <h2>Alerts & Events</h2>
          <p>Camera status events read from the event CSV.</p>
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
        {alerts.length === 0 && <div className="empty-data-state">No camera alerts have been recorded in the CSV yet.</div>}
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

function SettingsPage({ apiError, apiReady }) {
  return (
    <div className="settings-page">
      <div className="page-heading">
        <div>
          <h2>System Settings</h2>
          <p>Live camera and CSV data source.</p>
        </div>
      </div>
      <Panel
        title="Live Data Service"
        subtitle="Dashboard metrics are calculated from the camera event CSV."
      >
        <div className="settings-box">
          <div>
            <strong>Data source</strong>
            <span>camera_events.csv</span>
          </div>
          <div>
            <strong>Backend API</strong>
            <span>{apiError || (apiReady ? "Connected" : "Connecting")}</span>
          </div>
          <div>
            <strong>Refresh interval</strong>
            <span>2 seconds</span>
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
                <span>{camera.belt}</span>
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
