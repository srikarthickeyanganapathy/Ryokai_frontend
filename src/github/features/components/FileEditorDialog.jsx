import React, { useEffect, useMemo, useState } from 'react'
import {
  FileCode2, Loader2, AlertCircle, GitBranch, GitPullRequest, CheckCircle2,
  Save, RefreshCw, PencilLine, FileX2, Lock,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { Switch } from '@/shared/ui/Switch'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from '@/shared/ui/Modal'
import { useGithubFile, useWriteGithubFile, useCreateGithubBranch, useOpenGithubPullRequest } from '@/github/features/hooks/useGithub'

/* ============================================================
   FileEditorDialog — view a repository file, edit it, and commit
   through the Contents write API. Supports committing to any
   branch, creating a new branch first (branch-per-task), and
   opening a pull request right after the commit.
   ============================================================ */

const EMPTY_STATES = ['', 'null', 'undefined']

function isEmptyText(s) {
  return EMPTY_STATES.includes(s) || (typeof s === 'string' && s.trim().length === 0)
}

export function FileEditorDialog({ fullName, path, onClose }) {
  const [owner, repo] = (fullName || '').split('/')
  const { data: file, isLoading, isError, error, refetch, isFetching } = useGithubFile(fullName, path)
  const commitMutation = useWriteGithubFile()
  const branchMutation = useCreateGithubBranch()
  const prMutation = useOpenGithubPullRequest()

  const [mode, setMode] = useState('view') // 'view' | 'edit'
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')
  const [branch, setBranch] = useState('')
  const [createBranchFirst, setCreateBranchFirst] = useState(false)
  const [openPr, setOpenPr] = useState(false)
  const [prTitle, setPrTitle] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (file?.content != null) setContent(file.content)
    if (file && isEmptyText(branch)) setBranch((file.branch) || 'main')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  const binary = useMemo(() => {
    if (!file?.encoding) return false
    // Backend decodes base64 to UTF-8; NUL bytes / replacement chars mean binary.
    const c = file.content || ''
    return c.includes('\u0000')
  }, [file])

  const defaultBranch = file?.branch || 'main'
  const busy = commitMutation.isPending || branchMutation.isPending || prMutation.isPending

  const handleCommit = () => {
    setErrorMsg('')
    const run = async () => {
      if (createBranchFirst && branch !== defaultBranch) {
        await branchMutation.mutateAsync({ fullName, name: branch, base: defaultBranch })
      }
      const result = await commitMutation.mutateAsync({
        fullName,
        payload: { path, message, content, branch, sha: file?.sha },
      })
      if (openPr && branch !== defaultBranch) {
        await prMutation.mutateAsync({
          fullName,
          payload: {
            title: prTitle || message,
            body: `Committed from Ryokai (${owner}/${repo}).\n\nCommit message: ${message}`,
            head: branch,
            base: defaultBranch,
          },
        })
      }
      return result
    }
    run()
      .then(() => onClose())
      .catch((e) => setErrorMsg(e?.response?.data?.message || e?.message || 'Commit failed'))
  }

  return (
    <Modal open onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <FileCode2 className="w-[18px] h-[18px] text-[var(--accent)]" />
            <span className="truncate font-mono text-[13.5px]">{path}</span>
          </ModalTitle>
          <ModalDescription>
            {fullName}
            {file?.size > 0 && <span className="text-[var(--text-tertiary)]"> · {file.size} bytes</span>}
          </ModalDescription>
        </ModalHeader>

        {isLoading && (
          <div className="py-10 flex items-center justify-center gap-2 text-[var(--text-muted)]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading file…
          </div>
        )}

        {isError && (
          <div className="py-10 flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <FileX2 className="w-[18px] h-[18px] text-red-500" />
            </div>
            <p className="text-[12.5px] text-[var(--text-secondary)] max-w-[300px]">
              {error?.response?.data?.message || 'Could not load this file.'}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} isLoading={isFetching}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && binary && (
          <div className="py-10 flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center">
              <Lock className="w-[18px] h-[18px] text-[var(--text-muted)]" />
            </div>
            <p className="text-[12.5px] text-[var(--text-secondary)]">
              Binary file — can be viewed in GitHub, not edited here.
            </p>
          </div>
        )}

        {!isLoading && !isError && !binary && (
          <div className="space-y-3">
            {mode === 'view' ? (
              <pre className="max-h-[46vh] overflow-auto custom-scrollbar rounded-xl border border-[var(--color-border-subtle)] bg-[var(--bg-base)] p-4 text-[12px] leading-[1.6] font-mono text-[var(--text-secondary)] whitespace-pre-wrap break-words">
                {isEmptyText(file?.content) ? (
                  <span className="text-[var(--text-tertiary)] italic">Empty file</span>
                ) : (
                  file.content
                )}
              </pre>
            ) : (
              <>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[30vh] max-h-[38vh] font-mono text-[12px] leading-[1.6]"
                  aria-label="File content"
                />
                <div className="grid gap-3">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Commit message (required)"
                    maxLength={120}
                  />
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <GitBranch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                      <Input
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        placeholder={`Branch (default: ${defaultBranch})`}
                        className="pl-8 font-mono text-[12.5px]"
                        aria-label="Target branch"
                      />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch checked={createBranchFirst} onCheckedChange={setCreateBranchFirst} id="create-branch" />
                      <label htmlFor="create-branch" className="text-[12px] text-[var(--text-secondary)] cursor-pointer">
                        Create branch first
                      </label>
                    </div>
                  </div>
                  {createBranchFirst && branch === defaultBranch && (
                    <p className="text-[11.5px] text-amber-500 flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3" /> Branch already exists — give it a different name to create it.
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch checked={openPr} onCheckedChange={setOpenPr} id="open-pr" disabled={branch === defaultBranch} />
                      <label htmlFor="open-pr" className={cn('text-[12px] cursor-pointer', branch === defaultBranch ? 'text-[var(--text-tertiary)]' : 'text-[var(--text-secondary)]')}>
                        Open a pull request
                      </label>
                    </div>
                    {openPr && (
                      <Input
                        value={prTitle}
                        onChange={(e) => setPrTitle(e.target.value)}
                        placeholder="Pull request title (defaults to commit message)"
                        maxLength={120}
                        className="flex-1 text-[12.5px]"
                      />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {errorMsg && (
          <p className="text-[12px] text-red-500 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errorMsg}
          </p>
        )}

        {!isLoading && !isError && !binary && (
          <div className="flex items-center justify-end gap-2">
            {mode === 'view' ? (
              <>
                <span className="text-[11px] text-[var(--text-tertiary)] mr-auto font-mono">
                  {file?.sha ? file.sha.slice(0, 7) : ''}
                </span>
                <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
                <Button size="sm" onClick={() => { setMode('edit'); setErrorMsg('') }}>
                  <PencilLine className="w-3.5 h-3.5 mr-1" /> Edit file
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => setMode('view')} disabled={busy}>Cancel</Button>
                <Button
                  size="sm"
                  onClick={handleCommit}
                  disabled={busy || !message.trim() || !branch.trim()}
                >
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                  Commit{branch !== defaultBranch ? ` to ${branch}` : ''}
                </Button>
              </>
            )}
          </div>
        )}

        {!isLoading && !isError && !binary && mode === 'edit' && openPr && !createBranchFirst && branch !== defaultBranch && (
          <p className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1.5 -mt-2">
            <GitPullRequest className="w-3 h-3" /> The pull request will open from <span className="font-mono">{branch}</span> into{' '}
            <span className="font-mono">{defaultBranch}</span>. If the branch does not exist yet, enable “Create branch first”.
          </p>
        )}

        {commitMutation.isSuccess && (
          <p className="text-[12px] text-emerald-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Committed — closing…
          </p>
        )}
      </ModalContent>
    </Modal>
  )
}
