import "./globals.css";
import ToastProvider from "@/components/ToastProvider";

export const metadata = {
  title: "Battery Master - Business Management System",
  description: "Premium battery business management software for local sellers",
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