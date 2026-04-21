import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MessageCircle, User, ArrowLeft } from "lucide-react";

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch("https://studybuddy-api-t4hg.onrender.com//matches/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch matches");

        const data = await response.json();
        setMatches(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchMatches();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="mx-auto max-w-2xl pt-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <Link to="/feed" className="flex items-center text-slate-500 hover:text-blue-600">
            <ArrowLeft size={20} className="mr-1" />
            Back to Swiping
          </Link>
          <h1 className="text-xl font-bold text-blue-600">My Matches</h1>
        </div>

        {error && <p className="mb-4 text-center text-red-500">{error}</p>}

        {/* Matches Grid */}
        {matches.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <h2 className="mb-2 text-2xl font-bold text-slate-700">No matches yet 😢</h2>
            <p className="text-slate-500">Head back to the feed and keep swiping to find your perfect StudyBuddy!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {matches.map((match) => (
              <div key={match.user_id} className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-transform hover:scale-[1.02]">
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <User size={24} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">{match.username}</h2>
                      <p className="text-sm font-medium text-slate-500">{match.major}</p>
                    </div>
                  </div>
                  <p className="mb-4 text-sm text-slate-600">
                    <span className="font-semibold text-slate-700">Style:</span> {match.study_style}
                  </p>
                </div>
                
                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-50 p-3 font-semibold text-indigo-600 transition hover:bg-indigo-100">
                  <MessageCircle size={18} />
                  Send Message
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}