export default function HelpPage() {
  return (
    <div className="dashboard-grid">
      <div className="card">
        <h1>Help Center</h1>
        <p className="text-secondary">Quick guide for using the portal.</p>
      </div>

      <div className="card">
        <h2>How Search Works</h2>
        <p className="text-secondary">Use the top search box to filter surveys, reports, and submissions based on your current area.</p>
      </div>

      <div className="card">
        <h2>Role Access</h2>
        <p className="text-secondary">Users can complete assessments. Admins can review results, exports, and submissions.</p>
      </div>
    </div>
  );
}
