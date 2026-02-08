import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import ToastProvider from "@/components/ToastProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "LearnCart - Student Marketplace",
  description: "Buy, sell, and swap textbooks, electronics, furniture, and more within your campus community.",
  keywords: ["student marketplace", "textbooks", "college", "buy sell", "swap", "campus"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50 min-h-screen flex flex-col`}>
        <AuthProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}

