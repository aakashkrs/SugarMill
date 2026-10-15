// The dashboard data comes from the local Python API, which reads the event CSV.
// Login remains the existing local demo login and is separate from production data.

const DEMO_EMAIL = "admin@sugarmill.local";
const DEMO_PASSWORD = "Admin@123";

export async function login(email, password) {
  await new Promise(resolve => setTimeout(resolve, 350));
  return {
    success: email === DEMO_EMAIL && password === DEMO_PASSWORD,
    user: email === DEMO_EMAIL ? { email, role: "admin" } : null
  };
}

export async function getDashboardSummary(filter) {
  const params = new URLSearchParams();
  if (filter) {
    params.set("date", filter.date);
    params.set("from", filter.from);
    params.set("to", filter.to);
  }
  const query = params.toString();
  const response = await fetch(`/api/dashboard${query ? `?${query}` : ""}`);
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.detail || "Could not load CSV dashboard data");
  }
  return response.json();
}
