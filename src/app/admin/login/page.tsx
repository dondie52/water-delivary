import { PasswordLogin } from "@/components/auth/password-login";

export default function AdminLoginPage() {
  return (
    <PasswordLogin
      title="Admin access"
      description="Enter the Fresh Water Market admin password to continue."
      endpoint="/api/v1/admin/login"
      fallbackPath="/admin/orders"
    />
  );
}
