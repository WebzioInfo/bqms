"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Eye, EyeOff, Lock, Loader2, CheckCircle2, Shield } from "lucide-react";
import { changePassword } from "@/lib/actions/auth";

export default function SecurityPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!(session?.user as any)?.id) return;
    
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await changePassword(formData, (session!.user as any).id);
      if (res.error) {
        setMessage({ type: "error", text: res.error });
      } else if (res.success) {
        setMessage({ type: "success", text: res.success });
        (e.target as HTMLFormElement).reset();
      }
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center">
          <Shield className="h-6 w-6 mr-2 text-blue-600" />
          Account Security
        </h1>
        <p className="text-zinc-500 mt-1">Manage your password and security settings.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="p-6 border-b border-zinc-200 bg-zinc-50/50">
          <h2 className="text-lg font-medium text-zinc-900">Change Password</h2>
          <p className="text-sm text-zinc-500 mt-1">Ensure your account is using a long, random password to stay secure.</p>
        </div>

        <div className="p-6">
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-start text-sm ${
              message.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"
            }`}>
              {message.type === "success" && <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />}
              <p>{message.text}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  name="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  required
                  className="block w-full pl-10 pr-10 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600"
                >
                  {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100">
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                New Password
              </label>
              <div className="relative mb-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  name="newPassword"
                  type={showNew ? "text" : "password"}
                  required
                  className="block w-full pl-10 pr-10 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600"
                >
                  {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-zinc-500 mb-4">
                Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  className="block w-full pl-10 pr-10 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600"
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center items-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                {loading ? "Saving..." : "Save Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
