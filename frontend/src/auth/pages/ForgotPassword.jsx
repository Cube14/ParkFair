import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";

export default function ForgotPassword() {
  return (
    <AuthLayout title="Reset your password" subtitle="Contact your society administrator for a password reset.">
      <AuthCard>
        <Link to="/login" className="inline-flex items-center gap-2 font-medium underline">
          <ArrowLeft size={18} aria-hidden="true" />
          Back to sign in
        </Link>
      </AuthCard>
    </AuthLayout>
  );
}
