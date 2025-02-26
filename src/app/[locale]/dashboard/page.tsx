"use client";

import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations("dashboard");

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t("welcome")}</h1>
      <p className="text-gray-600 mb-8">{t("description")}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm text-gray-500">Projects</div>
              <div className="text-2xl font-bold">12</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm text-gray-500">Tasks</div>
              <div className="text-2xl font-bold">48</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm text-gray-500">Completed</div>
              <div className="text-2xl font-bold">31</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm text-gray-500">Pending</div>
              <div className="text-2xl font-bold">17</div>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              "Project Alpha updated",
              "New task added",
              "Task completed",
              "Comment added",
            ].map((activity, i) => (
              <div
                key={i}
                className="flex items-center gap-3 pb-3 border-b border-gray-100"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">{activity}</div>
                <div className="text-xs text-gray-400">2h ago</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
