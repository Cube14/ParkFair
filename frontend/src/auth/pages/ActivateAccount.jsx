import { useState } from "react";
import { motion } from "framer-motion";

import {
  Lock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import {
  useSearchParams,
  Link,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import AuthLayout from "../components/AuthLayout";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";

function ActivateAccount() {
  const navigate =
    useNavigate();

  const [searchParams] =
    useSearchParams();

  const token =
    searchParams.get("token");

  const [loading, setLoading] =
    useState(false);

  const [activated,
    setActivated] =
    useState(false);

  const [formData,
    setFormData] =
    useState({
      password: "",
      confirmPassword: "",
    });

  const residentData = {
    flatNumber: "302",
    ownerName:
      "Manoj Shukla",
  };

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      if (
        formData.password.length < 8
      ) {
        toast.error(
          "Password must be at least 8 characters."
        );
        return;
      }

      if (
        formData.password !==
        formData.confirmPassword
      ) {
        toast.error(
          "Passwords do not match."
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

        setActivated(true);

        toast.success(
          "Account activated successfully."
        );

      } catch (err) {
        toast.error(
          "Activation failed."
        );
      } finally {
        setLoading(false);
      }
    };

  if (!token) {
    return (
      <AuthLayout
        title="Invalid Link"
        subtitle="This activation link is missing or invalid."
      >
        <AuthCard>

          <div
            className="
              text-center
              space-y-6
            "
          >
            <ShieldCheck
              size={70}
              className="
                mx-auto
                text-red-500
              "
            />

            <h2
              className="
                text-3xl
                font-bold
              "
            >
              Activation Link Invalid
            </h2>

            <p
              className="
                text-zinc-400
              "
            >
              Please contact your
              society administrator.
            </p>

            <Link to="/login">
              <AuthButton>
                Back To Login
              </AuthButton>
            </Link>
          </div>

        </AuthCard>
      </AuthLayout>
    );
  }
    if (activated) {
    return (
      <AuthLayout
        title="Welcome To ParkFair"
        subtitle="Your account has been activated successfully."
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
            <motion.div
              animate={{
                scale: [
                  1,
                  1.08,
                  1,
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <CheckCircle2
                size={90}
                className="
                  mx-auto
                  text-green-500
                "
              />
            </motion.div>

            <h2
              className="
                mt-6
                text-4xl
                font-black
              "
            >
              Account Activated
            </h2>

            <p
              className="
                mt-4
                text-zinc-400
                leading-relaxed
              "
            >
              Your resident profile
              is now active.

              <br />
              <br />

              You can now access
              your parking status,
              schedule and society
              notifications.
            </p>

            <div
              className="
                mt-8
              "
            >
              <AuthButton
                onClick={() =>
                  navigate(
                    "/login"
                  )
                }
              >
                Continue To Login
              </AuthButton>
            </div>
          </motion.div>

        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Welcome Home"
      subtitle="Create a secure password to activate your ParkFair account."
    >
      <AuthCard>

        {/* RESIDENT INFO */}

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
              mb-4
            "
          >
            <ShieldCheck
              size={22}
              className="
                text-red-500
              "
            />

            <span
              className="
                font-semibold
              "
            >
              Verified Resident
            </span>
          </div>

          <div
            className="
              space-y-2
            "
          >
            <p>
              <span
                className="
                  text-zinc-400
                "
              >
                Flat:
              </span>{" "}
              {
                residentData.flatNumber
              }
            </p>

            <p>
              <span
                className="
                  text-zinc-400
                "
              >
                Resident:
              </span>{" "}
              {
                residentData.ownerName
              }
            </p>
          </div>
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
            label="Create Password"
            name="password"
            type="password"
            value={
              formData.password
            }
            onChange={
              handleChange
            }
            placeholder="
              Minimum 8 characters
            "
            icon={
              <Lock
                size={18}
              />
            }
          />

          <AuthInput
            label="
              Confirm Password
            "
            name="
              confirmPassword
            "
            type="password"
            value={
              formData.confirmPassword
            }
            onChange={
              handleChange
            }
            placeholder="
              Re-enter password
            "
            icon={
              <Lock
                size={18}
              />
            }
          />

          <AuthButton
            type="submit"
            loading={loading}
          >
            Activate Account
          </AuthButton>
        </form>

        <div
          className="
            mt-8
            text-center
          "
        >
          <Link
            to="/login"
            className="
              text-sm
              text-zinc-400
              hover:text-red-500
              transition
            "
          >
            Back To Login
          </Link>
        </div>

      </AuthCard>
    </AuthLayout>
  );
}

export default ActivateAccount;