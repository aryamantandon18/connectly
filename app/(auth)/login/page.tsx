"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaGoogle, FaGithub } from "react-icons/fa"; // ✅ added

export const loginSchema = z.object({
  email: z.string().trim()
    .min(1, { message: 'Email required!' })
    .email("Invalid email address"),
  password: z.string().trim()
    .min(1, { message: 'Password required!' })
    .min(8, "Password must be at least 8 characters long"),
});

export default function SignInPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      loginSchema.parse(formData);
      setErrors({});

      const res = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (res?.error) {
        if (res.error === "Email not verified") {
          toast.error("Please verify your email address.");
        } else {
          toast.error("Invalid email or password.");
        }
      }

      if (res?.ok) {
        toast.success("Logged in successfully!");
        router.push("/");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: { [key: string]: string } = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0].toString()] = error.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-discord-dark text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-discord-light p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Welcome Back!</h2>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              className="w-full mt-1 p-2 bg-discord-dark rounded border border-gray-600 focus:ring-2 focus:ring-discord-primary outline-none"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              className="w-full mt-1 p-2 bg-discord-dark rounded border border-gray-600 focus:ring-2 focus:ring-discord-primary outline-none"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-discord-primary text-white rounded-lg hover:bg-indigo-600 transition duration-300 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <span className="loader border-white border-t-transparent border-2 w-5 h-5 rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Social Logins */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
          >
            <FaGoogle size={20} />
            Sign in with Google
          </button>
          <button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="w-full py-2 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition flex items-center justify-center gap-2"
          >
            <FaGithub size={20} />
            Sign in with GitHub
          </button>
        </div>
        
        <p className="text-sm text-center mt-4">
          Don&apos;t have an account?{" "}  
          <Link href="/signup" className="text-discord-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
