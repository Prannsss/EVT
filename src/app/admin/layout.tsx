
import AdminLayout from '@/layouts/AdminLayout';

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  // Use the centralized AdminLayout to avoid duplicate sidebars/layout issues.
  return <AdminLayout>{children}</AdminLayout>;
}
