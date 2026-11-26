import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";

export default function Signup() {
  return (
    <AuthLayout title="Get a ParkFair account" subtitle="Ask your society administrator to create your resident account.">
      <AuthCard>
        <Link to="/login" className="inline-flex items-center gap-2 font-medium underline">
          <ArrowLeft size={18} aria-hidden="true" />
          Back to sign in
        </Link>
      </AuthCard>
    </AuthLayout>
  );
}
