import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Matches from "./pages/Matches";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
        <Routes>
          {/* Default route goes to Login */}
          <Route path="/" element={<Login />} />
          
          {/* Registration route */}
          <Route path="/register" element={<Register />} />
          
          {/* The Discovery Feed */}
          <Route path="/feed" element={<Feed />} />
          
          {/* Catch-all redirects back to login */}
          <Route path="*" element={<Navigate to="/" />} />

          {/* Matches page */}
          <Route path="/matches" element={<Matches />} /> 
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;