// @ts-nocheck
import React, {useEffect, useState} from 'react';
import {Star, GitFork, ExternalLink} from 'lucide-react';

type GitHubRepoData = {
  name: string;
  full_name: string;
  description: string | undefined;
  html_url: string;
  language: string | undefined;
  stargazers_count: number;
  forks_count: number;
  topics?: string[];
  updated_at: string;
};

type GitHubRepoCardProps = {
  /** Owner/repo, e.g. "wranngle/voice_ai_agent_evals" */
  fullName: string;
  /** Static blurb to show as fallback when the API fails. */
  fallbackBlurb: string;
  /** Operator role tag (e.g. "Eval harness"). */
  role: string;
  isDark: boolean;
};

/**
 * Approximate GitHub language colours. Covers the languages this repo grid
 * actually returns; everything else falls back to neutral grey.
 */
const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572a5',
  Go: '#00add8',
  Rust: '#dea584',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Markdown: '#083fa1',
  Dockerfile: '#384d54',
};

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const CACHE_PREFIX = 'wranngle:gh-repo:';

function readCache(fullName: string): GitHubRepoData | undefined {
  try {
    const raw = globalThis.localStorage?.getItem(CACHE_PREFIX + fullName);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as {ts: number; data: GitHubRepoData};
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return undefined;
    return parsed.data;
  } catch {
    return undefined;
  }
}

function writeCache(fullName: string, data: GitHubRepoData) {
  try {
    globalThis.localStorage?.setItem(
      CACHE_PREFIX + fullName,
      JSON.stringify({ts: Date.now(), data}),
    );
  } catch {
    /* ignore quota / private mode */
  }
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
  const days = Math.floor(seconds / 86_400);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

export default function GitHubRepoCard({
  fullName,
  fallbackBlurb,
  role,
  isDark,
}: GitHubRepoCardProps) {
  const [data, setData] = useState<GitHubRepoData | undefined>(() =>
    readCache(fullName),
  );
  const [loading, setLoading] = useState<boolean>(
    () => readCache(fullName) === undefined,
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    const cached = readCache(fullName);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`https://api.github.com/repos/${fullName}`, {
          headers: {Accept: 'application/vnd.github+json'},
        });
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        setData(json);
        writeCache(fullName, json);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fullName]);

  const surfaceClasses = isDark
    ? 'bg-[#18181b] border-white/10 text-[#fcfaf5]'
    : 'bg-white border-black/5 text-[#12111a]';

  const repoUrl = `https://github.com/${fullName}`;
  const shortName = fullName.split('/')[1] ?? fullName;

  if (loading) {
    return (
      <div
        className={`relative h-full p-6 rounded-[24px_4px_24px_4px] border-y border-r border-l-4 border-l-[var(--s500)] ${surfaceClasses} animate-pulse`}
      >
        <div className="h-5 w-32 bg-current opacity-10 rounded mb-3" />
        <div className="h-3 w-full bg-current opacity-10 rounded mb-2" />
        <div className="h-3 w-4/5 bg-current opacity-10 rounded mb-4" />
        <div className="flex gap-3">
          <div className="h-3 w-16 bg-current opacity-10 rounded" />
          <div className="h-3 w-16 bg-current opacity-10 rounded" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    // Graceful fallback — render the static blurb with a manual link.
    return (
      <a
        href={repoUrl}
        target="_blank"
        rel="noreferrer"
        className={`relative h-full p-6 rounded-[24px_4px_24px_4px] border-y border-r border-l-4 border-l-[var(--s500)] ${surfaceClasses} block hover:rounded-[4px_24px_4px_24px] transition-all group`}
      >
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <h3 className="brand-font text-lg font-bold group-hover:text-[var(--s500)] transition-colors">
            {shortName}
          </h3>
          <span className="text-[10px] uppercase tracking-wider opacity-60">
            {role}
          </span>
        </div>
        <p className="text-sm opacity-80 leading-relaxed">{fallbackBlurb}</p>
      </a>
    );
  }

  const langColor = data.language
    ? (LANG_COLORS[data.language] ?? '#888')
    : '#888';

  return (
    <a
      href={data.html_url}
      target="_blank"
      rel="noreferrer"
      className={`relative h-full p-6 rounded-[24px_4px_24px_4px] border-y border-r border-l-4 border-l-[var(--s500)] ${surfaceClasses} flex flex-col hover:rounded-[4px_24px_4px_24px] transition-all group`}
    >
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <h3 className="brand-font text-lg font-bold group-hover:text-[var(--s500)] transition-colors flex items-center gap-2">
          {shortName}
          <ExternalLink
            size={14}
            className="opacity-40 group-hover:opacity-100 transition-opacity"
          />
        </h3>
        <span className="text-[10px] uppercase tracking-wider opacity-60">
          {role}
        </span>
      </div>

      <p className="text-sm opacity-80 leading-relaxed mb-4 flex-1">
        {data.description ?? fallbackBlurb}
      </p>

      {data.topics && data.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {data.topics.slice(0, 5).map((topic) => (
            <span
              key={topic}
              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                isDark
                  ? 'bg-[var(--s500)]/15 text-[var(--s500)]'
                  : 'bg-[var(--s500)]/10 text-[var(--s500)]'
              }`}
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs mono-font opacity-70 mt-auto pt-3 border-t border-current/10">
        {data.language && (
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{backgroundColor: langColor}}
              aria-hidden
            />
            {data.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Star size={12} /> {data.stargazers_count}
        </span>
        {data.forks_count > 0 && (
          <span className="flex items-center gap-1">
            <GitFork size={12} /> {data.forks_count}
          </span>
        )}
        <span className="ml-auto">Updated {relativeTime(data.updated_at)}</span>
      </div>
    </a>
  );
}
