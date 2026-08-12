// API abstraction layer.
// Currently returns mock/demo authentication.
// Later replace these functions with fetch/axios calls to your backend API.

const DEMO_EMAIL = "admin@sugarmill.local";
const DEMO_PASSWORD = "Admin@123";

export async function login(email, password) {
  await new Promise(resolve => setTimeout(resolve, 350));
  return {
    success: email === DEMO_EMAIL && password === DEMO_PASSWORD,
    user: email === DEMO_EMAIL ? { email, role: "admin" } : null
  };
}

export async function getDashboardSummary() {
  // Later:
  // const response = await fetch("/api/dashboard/summary");
  // return response.json();
}

export async function getGodowns() {
  // Later: fetch("/api/godowns")
}

export async function getProduction() {
  // Later: fetch("/api/production")
}

export async function getBelts() {
  // Later: fetch("/api/belts")
}

export async function getAlerts() {
  // Later: fetch("/api/alerts")
}
