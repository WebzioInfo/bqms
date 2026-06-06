"use client";

import { useState } from "react";
import { resetPassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await resetPassword(formData, token);
      if (res.error) {
        setMessage({ type: "error", text: res.error });
      } else if (res.success) {
        setMessage({ type: "success", text: res.success });
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-zinc-200">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-zinc-900">Set New Password</h2>
          <p className="mt-2 text-sm text-zinc-600">Please enter your new strong password</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && (
            <div className={`px-4 py-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
              {message.text}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700">New Password</label>
              <div className="relative mt-1">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700">Confirm Password</label>
              <div className="relative mt-1">
                <Input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="text-xs text-zinc-500">
            Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.
          </div>

          <Button type="submit" className="w-full" disabled={loading || message?.type === "success"}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            {loading ? "Resetting..." : "Reset Password"}
          </Button>

          <div className="text-center mt-4">
            <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Return to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
