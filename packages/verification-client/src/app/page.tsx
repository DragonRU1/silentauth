export default function Home() {
  return (
    <div className="text-center space-y-4">
      <h1 className="text-3xl font-bold">
        Silent<span className="text-indigo-400">Auth</span>
      </h1>
      <p className="text-gray-400">
        This is the verification client. Open a verification link to proceed.
      </p>
      <p className="text-sm text-gray-600">
        Example: <code>/verify?token=YOUR_SESSION_TOKEN</code>
      </p>
    </div>
  );
}
