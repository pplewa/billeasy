"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { Suspense, useState } from "react";

function SignInContent() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setIsSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send login link"
      );
      console.error("Sign in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border">
        <h1 className="text-2xl font-bold mb-6">{t("checkEmail")}</h1>
        <p className="mb-4">{t("emailSent", { email })}</p>
        <p className="text-sm text-gray-500">
          The link will expire in 30 minutes. If you don&apos;t see the email,
          check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border">
      <h1 className="text-2xl font-bold mb-6">{t("signIn")}</h1>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("emailLabel")}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            required
            disabled={isLoading}
            className="w-full"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? tCommon("loading") : t("sendLink")}
        </Button>
      </form>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border">
          <h1 className="text-2xl font-bold mb-6">Loading...</h1>
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
