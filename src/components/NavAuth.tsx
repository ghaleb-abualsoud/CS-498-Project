import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/auth";

const NavAuth: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg">Health Risk</Link>
        <div className="flex items-center gap-3">
          {!user && (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}

          {user && (
            <div className="flex items-center gap-3">
              <Link to="/history" className="text-sm text-muted-foreground">My Assessments</Link>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavAuth;
