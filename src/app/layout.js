import "./globals.css";
import ToastProvider from "@/components/ToastProvider";

export const metadata = {
  title: "Ledger Pro - Business Management System",
  description: "Premium business management software for local sellers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 font-sans">
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}