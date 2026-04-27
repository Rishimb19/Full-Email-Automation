// src/components/Navbar.js
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Send, Settings, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar({ showUser = true }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="navbar">
      <Link href="/dashboard" className="navbar-logo">
        <div className="navbar-logo-icon">
          <Send size={16} strokeWidth={2.5} />
        </div>
        MailForge
      </Link>

      {showUser && user && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span
            style={{ fontSize: 13, color: "var(--text-3)", marginRight: 8 }}
          >
            {user.name}
          </span>
          // Add Settings link - already in your navbar // Make sure it has
          href="/settings"
          <Link
            href="/settings"
            className="btn btn-ghost btn-icon"
            title="Settings"
          >
            <Settings size={16} />
          </Link>
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-icon"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </nav>
  );
}
