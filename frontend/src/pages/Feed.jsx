import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import TinderCard from "react-tinder-card";
import { GraduationCap, BookOpen, User } from "lucide-react";

export default function Feed() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  //  Fetch the Discovery Feed when the page loads
  useEffect(() => {
    const fetchDiscoveryFeed = async () => {
      const token = localStorage.getItem("token");
      // If there's no token kick them back to login
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch("https://studybuddy-api-t4hg.onrender.com//discovery/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch discovery feed");

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchDiscoveryFeed();
  }, [navigate]);

  //  Handle the Swipe Action
  const onSwipe = async (direction, targetId) => {

    if (direction !== "right" && direction !== "left") return;

    const action = direction === "right" ? "REQUEST" : "SKIP";
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("https://studybuddy-api-t4hg.onrender.com//swipe/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          target_id: targetId,
          action: action,
        }),
      });

      const data = await response.json();
      
      // If it's a mutual match, trigger an alert
      if (data.match_status === "MATCHED") {
        alert("🎉 IT'S A MATCH! 🎉");
      }
    } catch (err) {
      console.error("Failed to record swipe", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return ( 
    <div className="flex min-h-screen flex-col items-center overflow-hidden bg-slate-100 p-4">
      <h1 className="text-xl font-bold text-blue-600">StudyBuddy</h1>
     {/* Navbar */}
      <div className="w-full max-w-md mb-8 flex justify-between items-center p-4 bg-white rounded-2xl shadow-sm">
        
        <Link to="/matches" className="text-sm font-semibold text-slate-500 transition hover:text-blue-600">
          My Matches
        </Link>
        <button 
          onClick={handleLogout}
          className="text-sm font-semibold text-slate-500 transition hover:text-red-500"
        >
          Logout
        </button>
      </div>

      {error && <p className="mb-4 text-red-500">{error}</p>}

      {/* Card Stack Container */}
      <div className="relative h-[450px] w-full max-w-sm">
        {users.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-2xl bg-white shadow-xl">
            <p className="text-lg font-medium text-slate-500">No more study buddies found!</p>
          </div>
        ) : (
          /* We reverse the array so the highest match score is visually on top of the deck */
          [...users].reverse().map((user) => (
            <TinderCard
              key={user.user_id}
              className="absolute inset-0"
              onSwipe={(dir) => onSwipe(dir, user.user_id)}
              preventSwipe={["up", "down"]} // Lock to Tinder-style horizontal swiping
            >
              <div className="flex h-full w-full flex-col justify-end rounded-2xl bg-white p-6 shadow-xl border border-slate-200 cursor-grab active:cursor-grabbing">
                {/* Visual Banner for Profile Picture Placeholder */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-t-2xl"></div>
                
                <div className="relative z-10 bg-white rounded-xl p-5 shadow-sm border border-slate-100 mt-20">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="text-blue-500" size={24} />
                    <h2 className="text-2xl font-bold text-slate-800">{user.username}</h2>
                  </div>
                  
                  <div className="flex items-center gap-3 text-slate-600 mb-2">
                    <GraduationCap size={20} />
                    <p className="font-medium text-lg">{user.major}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 text-slate-600 mb-6">
                    <BookOpen size={20} />
                    <p>{user.study_style} Studier</p>
                  </div>

                  <div className="inline-block rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700 shadow-sm border border-green-200">
                    Match Score: {user.match_score}
                  </div>
                </div>
              </div>
            </TinderCard>
          ))
        )}
      </div>
      
      {/* Swipe Instructions */}
      <p className="mt-10 text-sm font-medium tracking-widest text-slate-400 uppercase">
        Swipe Left to Skip &bull; Swipe Right to Request
      </p>
    </div>
  );
}