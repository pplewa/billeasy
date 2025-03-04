"use client";

import { Button } from "@/components/ui/button";
import useAuthStore from "@/store/auth-store";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function VerifyContent() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState("");

  const { setUser } = useAuthStore();

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setStatus("error");
        setError(t("invalidLink"));
        return;
      }

      try {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Verification failed");
        }

        // Set the user in the global state
        if (data.user) {
          setUser(data.user);
        }

        setStatus("success");

        // Redirect to invoices after a short delay
        setTimeout(() => {
          router.push("/invoices");
        }, 2000);
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Verification failed");
        console.error("Verification error:", err);
      }
    }

    verifyToken();
  }, [token, router, setUser, t]);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border text-center">
      {status === "loading" && (
        <>
          <h1 className="text-2xl font-bold mb-4">{t("verify")}</h1>
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </>
      )}

      {status === "success" && (
        <>
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-4">{t("success")}</h1>
          <p>Redirecting to dashboard...</p>
        </>
      )}

      {status === "error" && (
        <>
          <div className="text-red-500 text-5xl mb-4">✗</div>
          <h1 className="text-2xl font-bold mb-4">{t("error")}</h1>
          <p className="mb-6 text-red-600">{error}</p>
          <Button onClick={() => router.push("/signin")}>
            {t("tryAgain")}
          </Button>
        </>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm border text-center">
          <h1 className="text-2xl font-bold mb-4">Verifying...</h1>
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
