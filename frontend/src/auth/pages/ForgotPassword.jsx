import { useState } from "react";

import { motion } from "framer-motion";

import {
  Mail,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import toast from "react-hot-toast";

import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";

function ForgotPassword() {
  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [sent, setSent] =
    useState(false);

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      if (!email.trim()) {
        toast.error(
          "Please enter your email."
        );
        return;
      }

      try {
        setLoading(true);

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              1800
            )
        );

        setSent(true);

        toast.success(
          "Reset link sent."
        );

      } catch (err) {
        toast.error(
          "Unable to send reset link."
        );
      } finally {
        setLoading(false);
      }
    };

  if (sent) {
    return (
      <AuthLayout
        title="Check Your Inbox"
        subtitle="We've sent a password reset link."
      >
        <AuthCard>

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="
              text-center
            "
          >
            <CheckCircle2
              size={90}
              className="
                mx-auto
                text-green-500
              "
            />

            <h2
              className="
                mt-6
                text-4xl
                font-black
              "
            >
              Email Sent
            </h2>

            <p
              className="
                mt-4
                text-zinc-400
                leading-relaxed
              "
            >
              If an account exists
              with this email,
              a reset link has
              been sent.
            </p>

            <div
              className="
                mt-8
              "
            >
              <Link to="/login">
                <AuthButton>
                  Back To Login
                </AuthButton>
              </Link>
            </div>

          </motion.div>

        </AuthCard>
      </AuthLayout>
    );
  }
    return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email address and we'll send you a secure reset link."
    >
      <AuthCard>

        {/* SECURITY NOTICE */}

        <div
          className="
            mb-8

            rounded-3xl

            border
            border-red-500/15

            bg-red-500/5

            p-5
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
              mb-3
            "
          >
            <Mail
              size={20}
              className="
                text-red-500
              "
            />

            <span
              className="
                font-semibold
              "
            >
              Secure Recovery
            </span>
          </div>

          <p
            className="
              text-sm
              text-zinc-400
              leading-relaxed
            "
          >
            We will send a secure
            password reset link to
            the email associated
            with your resident
            profile.
          </p>
        </div>

        {/* FORM */}

        <form
          onSubmit={
            handleSubmit
          }
          className="
            space-y-6
          "
        >
          <AuthInput
            label="Email Address"
            name="email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            placeholder="
              Enter your email
            "
            icon={
              <Mail
                size={18}
              />
            }
          />

          <AuthButton
            type="submit"
            loading={loading}
          >
            Send Reset Link
          </AuthButton>
        </form>

        {/* FOOTER */}

        <div
          className="
            mt-8
            text-center
          "
        >
          <Link
            to="/login"
            className="
              inline-flex
              items-center
              gap-2

              text-sm
              text-zinc-400

              hover:text-red-500

              transition-all
              duration-300
            "
          >
            <ArrowLeft
              size={16}
            />

            Back To Login
          </Link>
        </div>

      </AuthCard>
    </AuthLayout>
  );
}

export default ForgotPassword; 