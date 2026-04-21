import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    major: "",
    study_style: "Quiet", // Default option
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("https://studybuddy-api-t4hg.onrender.com//users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // We send this as a standard JSON body, exactly like the Swagger UI did
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        // This catches the "Email already registered" error from the backend
        throw new Error(data.detail || "Failed to create account");
      }

      // Show success message, then redirect to login after 2 seconds
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 rounded-full bg-green-100 p-3 text-green-600">
            <UserPlus size={40} />
          </div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-slate-500">Join StudyBuddy today</p>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        {success && <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600">Account created successfully! Redirecting...</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-500 focus:outline-none" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-500 focus:outline-none" required />
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-500 focus:outline-none" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Major</label>
            <input type="text" name="major" placeholder="e.g. Computer Science" value={formData.major} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-500 focus:outline-none" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Study Style</label>
            <select name="study_style" value={formData.study_style} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-500 focus:outline-none">
              <option value="Quiet">Quiet</option>
              <option value="Collaborative">Collaborative</option>
              <option value="Visual">Visual</option>
              <option value="Auditory">Auditory</option>
            </select>
          </div>

          <button type="submit" className="mt-6 w-full rounded-lg bg-green-600 p-3 font-semibold text-white transition hover:bg-green-700">
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link to="/" className="font-semibold text-blue-600 hover:underline">Log in here</Link>
        </div>

      </div>
    </div>
  );
}