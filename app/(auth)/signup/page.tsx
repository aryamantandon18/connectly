"use client"

import {z} from "zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const signUpSchema = z.object({
  name: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});


export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      signUpSchema.parse(formData);
      // Clear errors and submit data
      setErrors({});
      axios.post("/api/auth/signup", formData, {
        headers: { "Content-Type": "application/json" },
      })
      .then((res)=>{
        if (res.status === 200) {
          router.push("/login"); // Navigate to sign-in page
        } else {
          alert(res.data.message || "Sign-up failed");
        }
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Sign-up failed");
      });
    }  catch (err) {
      // Handle validation errors
      if (err instanceof z.ZodError) {
        const fieldErrors: { [key: string]: string } = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0].toString()] = error.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        alert("An unexpected error occurred. Please try again.");
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
            className="w-full py-2 px-4 bg-discord-primary text-white rounded-lg hover:bg-indigo-600 transition duration-300"
          >
            Sign Up
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-discord-primary hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
