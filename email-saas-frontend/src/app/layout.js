// src/app/layout.js
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "MailForge — AI Email Campaigns",
  description: "Generate, personalize and send bulk email campaigns with AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            gutter={8}
            toastOptions={{
              duration: 3500,
              style: {
                background: "#1A2030",
                color: "#F0F2F8",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                padding: "12px 16px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              },
              success: {
                iconTheme: { primary: "#F5A623", secondary: "#0C0F14" },
              },
              error: {
                iconTheme: { primary: "#F87171", secondary: "#0C0F14" },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
