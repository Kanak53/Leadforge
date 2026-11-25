import { useEffect, useMemo, useState } from "react";
import {
  Users, UserPlus, PhoneCall, TrendingUp, Search, Plus, LogOut,
  LayoutDashboard, Download, Pencil, Trash2, X, Menu, Filter, BriefcaseBusiness
} from "lucide-react";
import api from "./api";

const emptyLead = { fullName: "", email: "", phone: "", company: "", source: "Website", status: "New" };
const statuses = ["New", "Contacted", "Interested", "Converted", "Lost"];

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("leadforge_user") || "null"));
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, converted: 0 });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [leadForm, setLeadForm] = useState(emptyLead);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const loadData = async () => {
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (filter !== "All") params.status = filter;
      const [leadRes, statsRes] = await Promise.all([
        api.get("/leads", { params }), api.get("/leads/stats")
      ]);
      setLeads(leadRes.data);
      setStats(statsRes.data);
    } catch (e) { setError(e.response?.data?.message || "Unable to load leads"); }
  };

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(loadData, 250);
    return () => clearTimeout(timer);
  }, [user, search, filter]);

  const authenticate = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const { data } = await api.post(endpoint, authForm);
      localStorage.setItem("leadforge_token", data.token);
      localStorage.setItem("leadforge_user", JSON.stringify(data.user));
      setUser(data.user);
    } catch (e) { setError(e.response?.data?.message || "Authentication failed"); }
    finally { setBusy(false); }
  };

  const logout = () => {
    localStorage.removeItem("leadforge_token"); localStorage.removeItem("leadforge_user");
    setUser(null); setLeads([]); setStats({ total: 0, new: 0, contacted: 0, converted: 0 });
  };

  const openAdd = () => { setEditing(null); setLeadForm(emptyLead); setError(""); setModal(true); };
  const openEdit = lead => {
    setEditing(lead._id);
    setLeadForm({ fullName: lead.fullName, email: lead.email, phone: lead.phone, company: lead.company, source: lead.source, status: lead.status });
    setError(""); setModal(true);
  };

  const saveLead = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try {
      if (editing) await api.put(`/leads/${editing}`, leadForm);
      else await api.post("/leads", leadForm);
      setModal(false); setLeadForm(emptyLead); setEditing(null); await loadData();
    } catch (e) { setError(e.response?.data?.message || "Could not save lead"); }
    finally { setBusy(false); }
  };

  const deleteLead = async id => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try { await api.delete(`/leads/${id}`); await loadData(); }
    catch (e) { setError(e.response?.data?.message || "Could not delete lead"); }
  };

  const updateStatus = async (lead, status) => {
    try {
      await api.put(`/leads/${lead._id}`, {
        fullName: lead.fullName, email: lead.email, phone: lead.phone,
        company: lead.company, source: lead.source, status
      });
      await loadData();
    } catch (e) { setError(e.response?.data?.message || "Could not update status"); }
  };

  const exportCsv = () => {
    const header = ["Full Name", "Email", "Phone", "Company", "Source", "Status", "Created Date"];
    const rows = leads.map(l => [l.fullName, l.email, l.phone, l.company, l.source, l.status, new Date(l.createdAt).toLocaleDateString()]);
    const csv = [header, ...rows].map(row => row.map(v => `"${String(v ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "leads.csv"; a.click(); URL.revokeObjectURL(url);
  };

  if (!user) return <div className="auth-page">
    <div className="auth-card">
      <div className="brand-mark"><BriefcaseBusiness size={24} /></div>
      <div className="eyebrow">LEADFORGE WORKSPACE</div>
      <h1>{authMode === "login" ? "Welcome back" : "Create your account"}</h1>
      <p className="muted">Manage relationships. Grow your business.</p>
      {error && <div className="alert">{error}</div>}
      <form onSubmit={authenticate} className="form-stack">
        {authMode === "register" && <label>Full name<input required value={authForm.name} onChange={e => setAuthForm({ ...authForm, name: e.target.value })} placeholder="Your name" /></label>}
        <label>Email address<input type="email" required value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} placeholder="you@company.com" /></label>
        <label>Password<input type="password" minLength="6" required value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} placeholder="At least 6 characters" /></label>
        <button className="primary-btn full" disabled={busy}>{busy ? "Please wait..." : authMode === "login" ? "Sign in" : "Create account"}</button>
      </form>
      <p className="switch-auth">{authMode === "login" ? "New to LeadForge?" : "Already have an account?"} <button onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setError(""); }}>{authMode === "login" ? "Create account" : "Sign in"}</button></p>
    </div>
  </div>;

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
      <div className="brand"><div className="brand-mark"><BriefcaseBusiness size={21} /></div><span>Lead<span className="brand-accent">Forge</span></span></div>
      <div className="nav-label">WORKSPACE</div>
      <button className="nav-item active"><LayoutDashboard size={18} /> Dashboard</button>
      <div className="sidebar-bottom">
        <div className="profile"><div className="avatar">{user.name?.charAt(0).toUpperCase()}</div><div className="profile-info"><strong>{user.name}</strong><small>{user.email}</small></div></div>
        <button className="logout-btn" onClick={logout}><LogOut size={17} /> Sign out</button>
      </div>
    </aside>
    <main className="main-content">
      <header className="topbar">
        <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)}><Menu /></button>
        <div><div className="eyebrow">OVERVIEW</div><h2>Lead Dashboard</h2></div>
        <div className="top-actions"><span className="date-label">{new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span><button className="primary-btn" onClick={openAdd}><Plus size={17} /> Add new lead</button></div>
      </header>

      {error && !modal && <div className="alert page-alert">{error} <button onClick={() => setError("")}><X size={15}/></button></div>}

      <section className="welcome-row"><div><h1>Good to see you, {user.name?.split(" ")[0]} <span>✦</span></h1><p>Here’s what’s happening with your leads today.</p></div></section>

      <section className="stats-grid">
        <StatCard label="Total leads" value={stats.total} icon={<Users />} tone="blue" note="All leads in workspace" />
        <StatCard label="New leads" value={stats.new} icon={<UserPlus />} tone="purple" note="Awaiting first contact" />
        <StatCard label="Contacted" value={stats.contacted} icon={<PhoneCall />} tone="orange" note="Conversation started" />
        <StatCard label="Converted" value={stats.converted} icon={<TrendingUp />} tone="green" note="Successful conversions" />
      </section>

      <section className="leads-panel">
        <div className="panel-heading"><div><h3>All leads</h3><p>Manage and track your potential customers</p></div><div className="panel-actions"><button className="outline-btn" onClick={exportCsv}><Download size={16}/> Export CSV</button></div></div>
        <div className="toolbar">
          <div className="search-box"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, company..." /></div>
          <div className="filter-box"><Filter size={16}/><select value={filter} onChange={e => setFilter(e.target.value)}><option>All</option>{statuses.map(s => <option key={s}>{s}</option>)}</select></div>
        </div>
        <div className="table-wrap">
          <table><thead><tr><th>LEAD</th><th>COMPANY</th><th>PHONE</th><th>SOURCE</th><th>STATUS</th><th>CREATED</th><th>ACTIONS</th></tr></thead>
            <tbody>{leads.map(lead => <tr key={lead._id}>
              <td><div className="lead-person"><div className="person-avatar">{lead.fullName.charAt(0).toUpperCase()}</div><div><strong>{lead.fullName}</strong><small>{lead.email}</small></div></div></td>
              <td>{lead.company}</td><td>{lead.phone}</td><td>{lead.source}</td>
              <td><select className={`status-select status-${lead.status.toLowerCase()}`} value={lead.status} onChange={e => updateStatus(lead, e.target.value)}>{statuses.map(s => <option key={s}>{s}</option>)}</select></td>
              <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
              <td><div className="row-actions"><button title="Edit lead" onClick={() => openEdit(lead)}><Pencil size={16}/></button><button title="Delete lead" onClick={() => deleteLead(lead._id)}><Trash2 size={16}/></button></div></td>
            </tr>)}</tbody>
          </table>
          {leads.length === 0 && <div className="empty-state"><div className="empty-icon"><Users size={25}/></div><h3>No leads found</h3><p>{search || filter !== "All" ? "Try changing your search or filter." : "Add your first lead to get started."}</p>{!search && filter === "All" && <button className="primary-btn" onClick={openAdd}><Plus size={16}/> Add your first lead</button>}</div>}
        </div>
        <div className="table-footer"><span>Showing <strong>{leads.length}</strong> lead{leads.length !== 1 ? "s" : ""}</span><span>Updated just now</span></div>
      </section>
      <footer className="footer">© {new Date().getFullYear()} LeadForge. Lead management made simple.</footer>
    </main>

    {modal && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModal(false); }}>
      <div className="modal">
        <div className="modal-head"><div><h3>{editing ? "Edit lead" : "Add a new lead"}</h3><p>Enter the contact details below.</p></div><button className="close-btn" onClick={() => setModal(false)}><X/></button></div>
        {error && <div className="alert">{error}</div>}
        <form onSubmit={saveLead}>
          <div className="form-grid">
            <label>Full name *<input required maxLength="100" value={leadForm.fullName} onChange={e => setLeadForm({ ...leadForm, fullName: e.target.value })} placeholder="e.g. Alex Morgan"/></label>
            <label>Email address *<input required type="email" value={leadForm.email} onChange={e => setLeadForm({ ...leadForm, email: e.target.value })} placeholder="alex@company.com"/></label>
            <label>Phone number *<input required pattern="[+]?[0-9 ()-]{7,20}" value={leadForm.phone} onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })} placeholder="+91 98765 43210"/></label>
            <label>Company name *<input required value={leadForm.company} onChange={e => setLeadForm({ ...leadForm, company: e.target.value })} placeholder="Company Ltd."/></label>
            <label>Lead source *<select value={leadForm.source} onChange={e => setLeadForm({ ...leadForm, source: e.target.value })}>{["Website", "Referral", "Social Media", "Advertisement", "Email Campaign", "Cold Call", "Other"].map(s => <option key={s}>{s}</option>)}</select></label>
            <label>Lead status<select value={leadForm.status} onChange={e => setLeadForm({ ...leadForm, status: e.target.value })}>{statuses.map(s => <option key={s}>{s}</option>)}</select></label>
          </div>
          <div className="modal-actions"><button type="button" className="outline-btn" onClick={() => setModal(false)}>Cancel</button><button className="primary-btn" disabled={busy}>{busy ? "Saving..." : editing ? "Save changes" : "Create lead"}</button></div>
        </form>
      </div>
    </div>}
  </div>;
}

function StatCard({ label, value, icon, tone, note }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className={`stat-icon ${tone}`}>{icon}</div></div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>;
}

export default App;
