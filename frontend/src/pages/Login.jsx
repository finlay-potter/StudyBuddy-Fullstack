import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen } from "lucide-react";


export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // FastAPI's OAuth2 expects data as FormData, not a standard JSON object
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const response = await fetch("https://studybuddy-api-t4hg.onrender.com//token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Invalid username or password");
      }

      const data = await response.json();
      
      // Save the VIP Pass (JWT) to the browser's local storage
      localStorage.setItem("token", data.access_token);
      
      // Redirect the user to the Swiping Feed!
      navigate("/feed");
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 rounded-full bg-blue-100 p-3 text-blue-600">
            <BookOpen size={40} />
          </div>
          <h1 className="text-2xl font-bold">StudyBuddy</h1>
          <p className="text-slate-500">Find your perfect study match</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Sign In
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{" "}
           <Link to="/register" className="font-semibold text-blue-600 hover:underline">
           Sign up here
            </Link>
        </div>
      </div>
    </div>
  );
}