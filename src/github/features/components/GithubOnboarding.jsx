import React from 'react';
import { motion } from 'framer-motion';
import { Github, ArrowUpRight, KeyRound, PlugZap, Radio, RefreshCw, ShieldCheck, UserPlus } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { EASING } from '@/shared/lib/uxTokens';

const STEP_ICONS = [PlugZap, KeyRound, Radio];

/**
 * GithubOnboarding -- handles 4 states (Linear-style):
 * 1. backend not configured (installUrl == null)
 * 2. app installed but CURRENT user has not connected their GitHub account (needsConnect)
 * 3. app not installed yet (installUrl != null, installationId == null)
 * 4. app installed but no repos synced yet (installationId != null, onSync provided)
 */
export function GithubOnboarding({ installUrl, installationId, onSync, isSyncing, needsConnect, onConnect, connecting }) {
  const isInstalled = Boolean(installationId && onSync);

  const steps = needsConnect
    ? [
        { title: 'Connect your GitHub account', text: 'Authorize with your own GitHub identity -- each Ryokai user connects separately, like Linear.' },
        { title: 'Install the app', text: 'If you have not yet, install Ryokai on your GitHub account and pick your repositories.' },
        { title: 'Live feed', text: 'New PRs and pushes stream in the moment they happen.' },
      ]
    : isInstalled
    ? [
        { title: 'Trigger initial sync', text: 'Fetch repositories and metadata allowed by your GitHub App installation.' },
        { title: 'Check repo permissions', text: 'Ensure "All repositories" or specific repos are selected in GitHub App settings.' },
        { title: 'Live synchronization', text: 'Once synced, PRs and commits will appear in your workspace feed.' },
      ]
    : installUrl
    ? [
        { title: 'Install the app', text: 'Authorize Ryokai on your GitHub account or organization.' },
        { title: 'Pick repositories', text: 'Choose repos -- Ryokai mirrors PRs and commits locally.' },
        { title: 'Live feed', text: 'New PRs and pushes stream in the moment they happen.' },
      ]
    : [
        { title: 'Configure the backend', text: 'Set GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY and GITHUB_APP_SLUG in the backend .env.' },
        { title: 'Set the webhook secret', text: 'GITHUB_WEBHOOK_SECRET signs every delivery -- invalid signatures are rejected.' },
        { title: 'Restart & revisit', text: 'This page will pick up the config automatically after restart.' },
      ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASING.out }}
      aria-labelledby="github-onboarding-title"
      className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/60"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[var(--accent)]/10 blur-3xl" />
      <div className="relative flex flex-col items-center px-6 py-14 text-center sm:px-12">
        <div className="relative mb-5">
          <div aria-hidden="true" className="absolute inset-0 rounded-2xl bg-[var(--accent)]/20 blur-md animate-pulse motion-reduce:animate-none" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)]">
            {needsConnect ? (
              <UserPlus className="h-7 w-7 text-[var(--accent)]" strokeWidth={1.5} aria-hidden="true" />
            ) : isInstalled ? (
              <ShieldCheck className="h-7 w-7 text-[var(--accent)]" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Github className="h-7 w-7 text-[var(--accent)]" strokeWidth={1.5} aria-hidden="true" />
            )}
          </div>
        </div>
        <h2 id="github-onboarding-title" className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          {needsConnect
            ? 'Connect your GitHub account'
            : isInstalled
            ? 'GitHub App Connected'
            : installUrl
            ? 'Connect GitHub'
            : 'GitHub App not configured'}
        </h2>
        <p className="mt-2 max-w-md text-[13px] leading-relaxed text-[var(--text-secondary)]">
          {needsConnect
            ? "GitHub repositories are personal -- connect your own GitHub account to see the repos you have access to. Another user's connection is never shared with you."
            : isInstalled
            ? 'Your GitHub App is connected, but no repositories are cached yet. Click below to synchronize your repositories.'
            : installUrl
            ? 'Install the Ryokai GitHub App to mirror pull requests and commits into your workspace -- no code required.'
            : 'The backend needs GitHub App credentials before this module can light up. The page stays dormant until they are set.'}
        </p>

        <ol className="mt-8 grid w-full max-w-lg gap-2.5 text-left" aria-label="Setup steps">
          {steps.map((s, i) => {
            const Icon = STEP_ICONS[i] || Radio;
            return (
              <li
                key={s.title}
                className="group flex items-start gap-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-base)]/60 px-4 py-3.5 transition-colors duration-150 hover:border-[var(--accent-border)]"
              >
                <div
                  aria-hidden="true"
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)] transition-colors duration-150 group-hover:text-[var(--accent)]"
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-[var(--text-primary)]">{s.title}</div>
                  <div className="mt-0.5 text-[12px] leading-relaxed text-[var(--text-tertiary)]">{s.text}</div>
                </div>
                {/* Decorative -- the <ol> already conveys order to screen readers */}
                <span aria-hidden="true" className="ml-auto mt-0.5 font-mono text-[10px] font-semibold text-[var(--text-tertiary)]">0{i + 1}</span>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {needsConnect ? (
            <>
              <Button variant="primary" size="lg" onClick={onConnect} isLoading={connecting} className="group">
                <UserPlus className="mr-2 h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                Connect GitHub Account
              </Button>
              {installUrl && (
                <Button asChild variant="secondary" size="lg">
                  <a href={installUrl} target="_blank" rel="noreferrer">
                    Install the app on GitHub
                    <ArrowUpRight className="ml-1.5 h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </Button>
              )}
            </>
          ) : isInstalled ? (
            <>
              <Button variant="primary" size="lg" onClick={onSync} isLoading={isSyncing} className="group">
                <RefreshCw className="mr-2 h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                Sync Repositories Now
              </Button>
              {installUrl && (
                <Button asChild variant="secondary" size="lg">
                  <a href={installUrl} target="_blank" rel="noreferrer">
                    Manage on GitHub
                    <ArrowUpRight className="ml-1.5 h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </Button>
              )}
            </>
          ) : installUrl ? (
            <Button asChild variant="primary" size="lg" className="group">
              <a href={installUrl} target="_blank" rel="noreferrer">
                Install GitHub App
                <ArrowUpRight
                  className="ml-1.5 h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              disabled
              title="Set GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY and GITHUB_APP_SLUG in the backend .env, then restart the server."
            >
              Awaiting configuration
            </Button>
          )}
        </div>
        <p className="mt-3 text-[11px] text-[var(--text-tertiary)]">
          Tokens stay server-side   each user authorizes their own GitHub account
        </p>
      </div>
    </motion.section>
  );
}