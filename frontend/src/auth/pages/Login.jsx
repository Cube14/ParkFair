import { useState } from "react";

import { motion } from "framer-motion";

import {
  Mail,
  Lock,
  Shield,
  ArrowRight,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import AuthLayout from "../components/AuthLayout";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import AuthCard from "../components/AuthCard";

import { useAuth } from "../../context/AuthContext";

function Login() {
  const { login } =
    useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] =
    useState({
      identifier: "",
      password: "",
      rememberMe: false,
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const validateForm = () => {
    if (
      !formData.identifier.trim()
    ) {
      setError(
        "Please enter your Flat Number or Email."
      );

      return false;
    }

    if (
      !formData.password.trim()
    ) {
      setError(
        "Please enter your password."
      );

      return false;
    }

    return true;
  };

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setError("");

      if (!validateForm())
        return;

      try {
        setLoading(true);

        const data =
    await login({
        identifier:
            formData.identifier.trim(),
        password:
            formData.password,
    });

toast.success(
    "Welcome back to ParkFair."
);

if (data.user.role === "ADMIN") {

    navigate("/");

} else {

    navigate("/resident");

}

        toast.success(
          "Welcome back to ParkFair."
        );

      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data
            ?.message ||
            "Invalid credentials."
        );

        toast.error(
          "Login failed."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="
        Access your parking assignments,
        rotation schedule and society updates.
      "
    >
      <AuthCard>

        {/* SECURITY BADGE */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="
            flex
            items-center
            justify-center
            gap-2

            w-fit
            mx-auto

            px-4
            py-2

            rounded-full

            bg-red-500/10
            border
            border-red-500/20

            text-red-500
            text-sm
            font-medium

            mb-8
          "
        >
          <Shield size={16} />

          Secure Resident Access
        </motion.div>

        {/* ERROR */}

        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              mb-6

              rounded-2xl

              border
              border-red-500/20

              bg-red-500/10

              px-4
              py-3

              text-red-400
              text-sm
            "
          >
            {error}
          </motion.div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
          className="
            space-y-6
          "
        >
          {/* IDENTIFIER */}

          <AuthInput
            label="
              Flat Number or Email
            "
            name="identifier"
            placeholder="
              Flat 302 or shivansh@email.com
            "
            value={
              formData.identifier
            }
            onChange={
              handleChange
            }
            icon={
              <Mail
                size={18}
              />
            }
          />

          {/* PASSWORD */}

          <AuthInput
            label="Password"
            type="password"
            name="password"
            placeholder="
              Enter your password
            "
            value={
              formData.password
            }
            onChange={
              handleChange
            }
            icon={
              <Lock
                size={18}
              />
            }
          />
	            {/* OPTIONS */}

          <div
            className="
              flex
              items-center
              justify-between
              gap-4
            "
          >
            <label
              className="
                flex
                items-center
                gap-3
                cursor-pointer
                text-sm
              "
            >
              <input
                type="checkbox"
                name="rememberMe"
                checked={
                  formData.rememberMe
                }
                onChange={
                  handleChange
                }
                className="
                  w-4
                  h-4

                  accent-red-500

                  cursor-pointer
                "
              />

              <span
                className="
                  text-zinc-400
                "
              >
                Remember Me
              </span>
            </label>

            <Link
              to="/forgot-password"
              className="
                text-sm
                text-red-500
                hover:text-red-400
                transition
              "
            >
              Forgot Password?
            </Link>
          </div>

          {/* LOGIN BUTTON */}

          <AuthButton
            type="submit"
            disabled={loading}
          >
            <div
              className="
                flex
                items-center
                justify-center
                gap-2
              "
            >
              {loading
                ? "Signing In..."
                : "Sign In"}

              {!loading && (
                <ArrowRight
                  size={18}
                />
              )}
            </div>
          </AuthButton>

          {/* DIVIDER */}

          <div
            className="
              relative
              py-2
            "
          >
            <div
              className="
                absolute
                inset-0
                flex
                items-center
              "
            >
              <div
                className="
                  w-full
                  border-t
                  border-zinc-700
                "
              />
            </div>

            <div
              className="
                relative
                flex
                justify-center
              "
            >
              <span
                className="
                  bg-transparent
                  px-4
                  text-xs
                  uppercase
                  tracking-widest
                  text-zinc-500
                "
              >
                Resident Access
              </span>
            </div>
          </div>

          {/* ACTIVATE ACCOUNT */}

          <motion.div
            whileHover={{
              y: -2,
            }}
            className="
              rounded-2xl

              border
              border-red-500/20

              bg-red-500/5

              p-5
            "
          >
            <h3
              className="
                text-lg
                font-semibold
                mb-2
              "
            >
              First Time Here?
            </h3>

            <p
              className="
                text-sm
                text-zinc-400
                mb-4
              "
            >
              Your society administrator
              creates your account.
              Activate it before
              signing in.
            </p>

            <Link
              to="/activate-account"
              className="
                inline-flex
                items-center
                gap-2

                text-red-500
                font-medium

                hover:text-red-400
                transition
              "
            >
              Activate Account

              <ArrowRight
                size={16}
              />
            </Link>
          </motion.div>

          {/* FOOTER */}

          <div
            className="
              pt-4
              text-center
            "
          >
            <p
              className="
                text-xs
                text-zinc-500
                leading-relaxed
              "
            >
              By continuing you
              agree to ParkFair's
              security and parking
              management policies.
            </p>
          </div>

        </form>

      </AuthCard>
    </AuthLayout>
  );
}

export default Login;