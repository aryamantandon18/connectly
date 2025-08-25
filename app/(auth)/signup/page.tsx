"use client";

import { z } from "zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";
import { FaGithub, FaGoogle } from "react-icons/fa";

const signUpSchema = z.object({
  name: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false); // 👈 for loader

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      signUpSchema.parse(formData);
      setErrors({});
      setIsLoading(true); // 👈 start loading

      const response = await axios.post("/api/auth/signup", formData, {
        headers: { "Content-Type": "application/json" },
      });
      if (response.status == 200) {
      // User created successfully, now sign in
      const result = await signIn("credentials", {
        redirect: true,
        email: formData.email,
        password: formData.password,
        callbackUrl: "/", // or dashboard or wherever
      });

      if (result?.error) {
        toast.error("Login failed");
      }
      toast.success("Sign up successful! Redirecting...");
      router.push("/"); 
    }
  } catch (err: any) {
      setIsLoading(false); // 👈 stop loading on error

      if (err instanceof z.ZodError) {
        const fieldErrors: { [key: string]: string } = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0].toString()] = error.message;
          }
        });
        setErrors(fieldErrors);
        toast.error("Please correct the highlighted fields.");
      } else {
        const message = err?.response?.data?.message || "Sign-up failed.";
        toast.error(message);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-discord-dark text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-discord-light p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>
        <form className="space-y-4" onSubmit={handleSignUp}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              type="text"
              name="name"
              className="w-full mt-1 p-2 bg-discord-dark rounded border border-gray-600 focus:ring-2 focus:ring-discord-primary outline-none"
              placeholder="Enter your username"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
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
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              className="w-full mt-1 p-2 bg-discord-dark rounded border border-gray-600 focus:ring-2 focus:ring-discord-primary outline-none"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-discord-primary text-white rounded-lg hover:bg-indigo-600 transition duration-300 flex items-center justify-center"
          >
            {isLoading ? (
              <span className="loader border-white border-t-transparent border-2 w-5 h-5 rounded-full animate-spin" />
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
        <div className="mt-6 space-y-3">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            type="button"
            className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
          >
            <FaGoogle size={20} />
            Sign up with Google
          </button>
          <button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            type="button"
            className="w-full py-2 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition flex items-center justify-center gap-2"
          >
            <FaGithub size={20} />
            Sign up with GitHub
          </button>
        </div>
        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-discord-primary hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
