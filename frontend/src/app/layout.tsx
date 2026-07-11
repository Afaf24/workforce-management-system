import type { Metadata } from "next";
import { AuthProvider } from "@/hooks/use-auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI-Powered HR Management System",
  description: "Graduation project — HR management with an AI assistant.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-foreground">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
