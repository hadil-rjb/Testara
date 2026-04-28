"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useAuthStore } from "@/stores/auth-store";
import AuthInput from "@/components/auth/AuthInput";

export default function AccountTypePage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("inviteToken");
  const { user, isAuthenticated, isLoading, completeOnboarding } =
    useAuthStore();

  const [selected, setSelected] = useState<"individual" | "enterprise" | null>(
    null,
  );
  const [companyName, setCompanyName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Redirect unauthenticated users or those who completed onboarding
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push(
        inviteToken
          ? `/auth/register?inviteToken=${encodeURIComponent(inviteToken)}`
          : "/auth/register",
      );
    } else if (user?.onboardingCompleted) {
      router.push(inviteToken ? `/invite/${inviteToken}` : "/dashboard");
    }
  }, [isLoading, isAuthenticated, user, router, inviteToken]);

  const handleContinue = async () => {
    if (!selected) return;
    setError("");
    setSubmitting(true);
    try {
      const data: { accountType: string; companyName?: string } = {
        accountType: selected,
      };
      if (selected === "enterprise" && companyName.trim()) {
        data.companyName = companyName.trim();
      }
      await completeOnboarding(data);
      router.push(inviteToken ? `/invite/${inviteToken}` : "/dashboard");
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !isAuthenticated || user?.onboardingCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-auth-gradient">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-12 surface-card">
        <div className="max-w-lg mx-auto w-full">
          <span className="text-primary font-semibold text-sm tracking-wide uppercase">
            {t("joinUs")}
          </span>
          <h1 className="text-3xl font-bold font-heading mt-3 mb-2 text-heading">
            {t("chooseAccountType")}
          </h1>
          <p className="text-sm mb-10 text-body">
            {t("chooseAccountSubtitle")}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl alert-error text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Individual Card */}
            <button
              type="button"
              onClick={() => setSelected("individual")}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                selected === "individual"
                  ? "border-primary bg-primary/5"
                  : "border-theme hover:border-primary/30"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold font-heading text-base text-heading">
                  {t("individual")}
                </h3>
                <p className="text-sm mt-0.5 text-body">
                  {t("individualDesc")}
                </p>
              </div>
              {selected === "individual" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-primary flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </button>

            {/* Enterprise Card */}
            <button
              type="button"
              onClick={() => setSelected("enterprise")}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                selected === "enterprise"
                  ? "border-primary bg-primary/5"
                  : "border-theme hover:border-primary/30"
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold font-heading text-base text-heading">
                  {t("enterprise")}
                </h3>
                <p className="text-sm mt-0.5 text-body">
                  {t("enterpriseDesc")}
                </p>
              </div>
              {selected === "enterprise" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-primary flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Company name input (shown when enterprise is selected) */}
          {selected === "enterprise" && (
            <div className="mt-6">
              <AuthInput
                label={t("companyName")}
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
          )}

          {/* Continue button */}
          <button
            onClick={handleContinue}
            disabled={
              !selected ||
              submitting ||
              (selected === "enterprise" && !companyName.trim())
            }
            className="w-full mt-8 py-3 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "..." : t("continue")}
          </button>
        </div>
      </div>

      {/* Right Side - Purple */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center">
        <div className="text-center px-12">
          <div className="w-20 h-20 rounded-ful flex items-center justify-center mx-auto mb-3">
            <Image
              src="/Logo.png"
              alt="Logo"
              width={60}
              height={60}
              className="object-contain brightness-0 invert"
            />
          </div>
          <h2 className="text-3xl font-bold font-heading text-white mb-3">
            Testara
          </h2>
          <p className="text-white/70 text-sm max-w-xs mx-auto">
            AI-Powered QA Automation Platform
          </p>
        </div>
      </div>
    </div>
  );
}
