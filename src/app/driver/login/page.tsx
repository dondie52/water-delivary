import { PasswordLogin } from "@/components/auth/password-login";

export default function DriverLoginPage() {
  return (
    <PasswordLogin
      title="Driver access"
      description="Enter the Fresh Water Market driver password to open the runner board."
      endpoint="/api/v1/driver/login"
      fallbackPath="/driver"
    />
  );
}
