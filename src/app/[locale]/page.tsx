"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Suspense } from "react";

function HomeContent() {
  const t = useTranslations("home");
  const appT = useTranslations("app");
  const appName = appT("name");

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-12">
      <div className="text-center space-y-4 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t("title", { appName })}
        </h1>
        <p className="text-xl text-gray-600">{t("description")}</p>
        <div className="mt-8">
          <Button size="lg" asChild>
            <Link href="/dashboard">{t("getStarted")}</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mt-12">
        <FeatureCard
          title="Authentication"
          description="Secure authentication with email magic links. No passwords needed."
          icon="✉️"
        />
        <FeatureCard
          title="Internationalization"
          description="Support for multiple languages with next-intl. English, Spanish, French, and German included."
          icon="🌍"
        />
        <FeatureCard
          title="UI Components"
          description="Beautiful and accessible UI components built with Shadcn UI, Radix UI, and Tailwind CSS."
          icon="🎨"
        />
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
