'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

const steps = ['step1', 'step2', 'step3', 'step4'] as const;

/* ── Reusable tiny components for the chat demo ────────────────── */

function AgentBubble({ children, bold }: { children: React.ReactNode; bold?: string }) {
  return (
    <div className="flex gap-2.5 items-start">
      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47-2.47" />
        </svg>
      </div>
      <div className="rounded-2xl rounded-tl-md px-4 py-3 text-[13px] leading-relaxed max-w-[260px] surface-tertiary text-heading">
        {bold && <span className="font-semibold">{bold}</span>}
        {children}
      </div>
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div className="rounded-2xl rounded-tr-md px-4 py-2.5 text-[13px] leading-relaxed max-w-[220px] bg-primary text-white">
        {children}
      </div>
    </div>
  );
}

function ValidationPrompt({ onNo, onYes }: { onNo: string; onYes: string }) {
  return (
    <div className="rounded-2xl px-4 py-3 text-[13px] surface-tertiary text-heading">
      <p className="font-medium mb-2.5">Are these crawl results valid and correct?</p>
      <div className="flex gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-theme text-[12px] font-medium text-error transition-colors hover:bg-error/10">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {onNo}
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-theme text-[12px] font-medium text-success transition-colors hover:bg-success/10">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {onYes}
        </button>
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl px-5 py-4 text-center min-w-[100px] surface-card shadow-card border border-theme">
      <div className="text-2xl font-bold font-heading text-heading">{value}</div>
      <div className="text-[12px] font-medium mt-0.5 text-body">{label}</div>
    </div>
  );
}

function PageBreakdownRow() {
  return (
    <div className="flex gap-2 text-[11px] font-medium text-body">
      <span className="px-2 py-1 rounded-md surface-tertiary">12 liens</span>
      <span className="px-2 py-1 rounded-md surface-tertiary">1 formulaires</span>
      <span className="px-2 py-1 rounded-md surface-tertiary">8 images</span>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────────── */

export default function Process() {
  const t = useTranslations('process');
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="process" className="px-4 py-24 sm:px-6 lg:px-8 surface-secondary">
      <div className="mx-auto max-w-6xl">
        {/* ── Two-column grid: Steps (left) + Demo (right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* ── LEFT COLUMN: Header + Steps ── */}
          <div>
            {/* Header — left-aligned */}
            <div className="mb-14">
              <span className="text-primary font-semibold text-xs tracking-wide uppercase">
                {t('sectionLabel')}
              </span>
              <h2 className="font-heading text-4xl sm:text-[44px] font-extrabold leading-[1.1] mt-3 mb-4 text-heading">
                {t('title')}
              </h2>
              <p className="text-base leading-relaxed max-w-md text-body">
                {t('subtitle')}
              </p>
            </div>

            {/* Steps with vertical timeline */}
            <div className="relative">
              {steps.map((key, index) => {
                const isActive = activeStep === index;
                const isLast = index === steps.length - 1;

                return (
                  <div
                    key={key}
                    className="relative flex gap-5 cursor-pointer group"
                    onClick={() => setActiveStep(index)}
                    onMouseEnter={() => setActiveStep(index)}
                  >
                    {/* Timeline column */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      {/* Number circle */}
                      <div
                        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm transition-all duration-300 ${
                          isActive
                            ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110'
                            : 'text-primary surface-card border-2 border-primary'
                        }`}
                      >
                        {index + 1}
                      </div>
                      {/* Connector line */}
                      {!isLast && (
                        <div
                          className={`w-[2px] flex-1 min-h-[40px] transition-colors duration-300 ${
                            isActive ? 'bg-primary' : ''
                          }`}
                          style={!isActive ? { backgroundColor: 'var(--border-color)' } : undefined}
                        />
                      )}
                    </div>

                    {/* Text content */}
                    <div className={`pb-10 ${isLast ? 'pb-0' : ''}`}>
                      <h3
                        className={`font-heading text-lg font-bold mb-1.5 transition-colors duration-300 ${
                          isActive ? 'text-primary' : 'text-heading'
                        }`}
                      >
                        {t(`${key}.title`)}
                      </h3>
                      <p className="text-[14px] leading-relaxed max-w-sm text-body">
                        {t(`${key}.description`)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT COLUMN: Interactive Demo Mockup ── */}
          <div className="lg:sticky lg:top-24">
            <div
              className="rounded-3xl border border-theme surface-card overflow-hidden"
              style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}
            >
              {/* Demo header bar */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-theme">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 text-center text-[12px] font-medium text-body">
                  Website Testara
                </div>
                <div className="w-12" />
              </div>

              {/* Chat area — content changes based on active step */}
              <div className="p-5 space-y-4 min-h-[420px] transition-all duration-500">

                {/* Step 1: Explore */}
                <div className={`space-y-3.5 transition-all duration-500 ${activeStep === 0 ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'}`}>
                  <AgentBubble bold="Got it! Setting up Website Testara. ">
                    Checking if an existing report exists for <span className="font-semibold">www.saucedemo.com</span>...
                  </AgentBubble>

                  <AgentBubble>
                    No existing report found. Starting a fresh crawl of <span className="font-semibold">www.saucedemo.com</span>...
                    <br />
                    <span className="text-primary font-medium cursor-pointer hover:underline text-[12px]">Voir Plus</span>
                  </AgentBubble>

                  <div className="flex justify-center py-2">
                    <StatCard value="60" label="Routes" />
                  </div>

                  <ValidationPrompt onNo="No, please re-crawl" onYes="Yes, data is correct" />
                </div>

                {/* Step 2: Generate */}
                <div className={`space-y-3.5 transition-all duration-500 ${activeStep === 1 ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'}`}>
                  <AgentBubble bold="Crawl validated! ">
                    Now analyzing page structure for test scenario generation...
                  </AgentBubble>

                  <div className="space-y-2.5 pl-10">
                    <PageBreakdownRow />
                    <PageBreakdownRow />
                    <PageBreakdownRow />
                  </div>

                  <AgentBubble>
                    Generated <span className="font-semibold">24 E2E scenarios</span> covering login flows, cart operations, and checkout processes.
                  </AgentBubble>

                  <ValidationPrompt onNo="Regenerate scenarios" onYes="Approve scenarios" />
                </div>

                {/* Step 3: Execute */}
                <div className={`space-y-3.5 transition-all duration-500 ${activeStep === 2 ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'}`}>
                  <UserBubble>No, please re-crawl.</UserBubble>

                  <AgentBubble bold="Re-crawling from scratch with deeper analysis... ">
                    <br />
                    Crawling <span className="font-semibold">www.saucedemo.com</span> on DEVELOPMENT...
                    <br />
                    <span className="text-primary font-medium cursor-pointer hover:underline text-[12px]">Voir Plus</span>
                  </AgentBubble>

                  {/* Progress indicator */}
                  <div className="pl-10">
                    <div className="rounded-xl px-4 py-3 surface-tertiary">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[12px] font-medium text-heading">Executing tests...</span>
                        <span className="text-[12px] font-semibold text-primary">18/24</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: 'var(--border-color)' }}>
                        <div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: '75%' }} />
                      </div>
                    </div>
                  </div>

                  <ValidationPrompt onNo="No, please re-crawl" onYes="Yes, data is correct" />
                </div>

                {/* Step 4: Reports */}
                <div className={`space-y-3.5 transition-all duration-500 ${activeStep === 3 ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'}`}>
                  <AgentBubble bold="All tests completed! ">
                    Generating your custom report with detailed metrics...
                  </AgentBubble>

                  {/* Mini report card */}
                  <div className="pl-10">
                    <div className="rounded-xl p-4 space-y-3 surface-tertiary">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-heading">Test Report Summary</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-success/15 text-success font-medium">Complete</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <div className="text-lg font-bold text-success">22</div>
                          <div className="text-[10px] text-body">Passed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-error">2</div>
                          <div className="text-[10px] text-body">Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">91%</div>
                          <div className="text-[10px] text-body">Score</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <AgentBubble>
                    Report ready! You can download it as PDF or share it with your team.
                    <br />
                    <span className="text-primary font-medium cursor-pointer hover:underline text-[12px]">View Full Report</span>
                  </AgentBubble>
                </div>
              </div>

              {/* Chat input bar */}
              <div className="flex items-center gap-3 px-4 py-3 border-t border-theme">
                <div className="flex-1 rounded-xl px-4 py-2.5 text-[13px] surface-tertiary text-muted">
                  Type your answer...
                </div>
                <button className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 hover:bg-primary-dark transition-colors">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
