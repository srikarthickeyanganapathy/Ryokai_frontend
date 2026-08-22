import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { PageShell, PageHero, PageContent } from '@/shared/ui/PageShell'
import { PageState } from '@/shared/ui/PageState'
import { useOrgTeams, useOrgMembers } from '../../features/hooks/useOrganizations'
import { useTaskList } from '@/task'
import { useProjects } from '@/project'
import { CreateTeamModal } from '../modals/CreateTeamModal'
import { ManageTeamMembersModal } from '../modals/ManageTeamMembersModal'
import { usePermissions } from '@/identity'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { AnimatedCounter } from '../components/primitives'
import { TeamTileSkeleton } from '../components/TeamTileSkeleton'
import { EmptyState } from '../components/EmptyState'
import { TeamTile } from '../components/TeamTile'
import { ActivitySidebar } from '../components/ActivitySidebar'
import { ComparePanel } from '../components/ComparePanel'
import { QuickCreateModal } from '../components/QuickCreateModal'
import { detectTeamCategory, hashHue } from '../components/utils'
import { TeamAvatar } from '../components/TeamAvatar'
import { Skeleton } from '@/shared/ui/Skeleton';
import { useAuth } from '@/identity'
import { toast } from 'sonner'
import { EntityStatStrip, EntityFilterBar } from '@/shared/ui/entity-card'


/* ══════════════════════════════════════════════════════
 * MAIN COMPONENT — TeamsPage
 * (utility helpers, templates, mini primitives, and
 *  sub-components extracted to ../components/)
 * ══════════════════════════════════════════════════════ */

export const TeamsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { activeOrganization, workspaceMode, loadingWorkspace } = useWorkspace()
  const orgId = activeOrganization?.id
  const { data: teams = [], isLoading: teamsLoading, isError: teamsError, error, refetch: refetchTeams } = useOrgTeams(orgId)
  const { data: members = [] } = useOrgMembers(orgId)
  const { data: { tasks: allTasks = [] } = {} } = useTaskList({ scope: 'org' })
  const { data: allProjects = [] } = useProjects()

  const { canManage, canCreateTeam, canManageTeam } = usePermissions()

  // ── Modal state ──
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false)
  const [quickCreateOpen, setQuickCreateOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)

  // ── Filtering & categorization ──
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  // ── Compare mode ──
  const [compareMode, setCompareMode] = useState(false)
  const [compareTeams, setCompareTeams] = useState([])

  // ── Activity sidebar ──
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ── Favorites ──
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('ryokai_team_favorites')
      return stored ? JSON.parse(stored) : []
    } catch { /* parse error */ return [] }
  })

  useEffect(() => {
    try { localStorage.setItem('ryokai_team_favorites', JSON.stringify(favorites)) } catch { /* localStorage unavailable */ }
  }, [favorites])

  const toggleFavorite = useCallback((teamId) => {
    setFavorites(prev => prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId])
  }, [])

  // ── Per-team computed stats ──
  const teamStatsMap = useMemo(() => {
    const map = {}
    teams.forEach(t => {
      const tTasks = allTasks.filter(task => task.teamId === Number(t.id))
      const tProjects = allProjects.filter(p => p.teamId === Number(t.id))
      const done = tTasks.filter(task => task.status === 'Done' || task.status === 'COMPLETED').length
      map[t.id] = {
        taskCount: tTasks.length,
        projectCount: tProjects.length,
        doneCount: done,
        completionRate: tTasks.length > 0 ? Math.round((done / tTasks.length) * 100) : 0,
        activeTaskCount: tTasks.filter(task => task.status !== 'Done' && task.status !== 'COMPLETED' && !task.archived).length,
      }
    })
    return map
  }, [teams, allTasks, allProjects])

  // ── Category counts (for chips) ──
  const categoryCounts = useMemo(() => {
    const counts = { all: teams.length, mine: 0, engineering: 0, design: 0, marketing: 0, product: 0, favorites: favorites.length }
    teams.forEach(t => {
      const cat = detectTeamCategory(t, user?.id)
      if (cat !== 'all') counts[cat] = (counts[cat] || 0) + 1
      if (t.members?.some(m => m.userId === user?.id || m.username?.toLowerCase() === user?.username?.toLowerCase())) {
        counts.mine = (counts.mine || 0) + 1
      }
    })
    return counts
  }, [teams, user, favorites])

  // ── Filtered teams ──
  const filteredTeams = useMemo(() => {
    let result = teams
    const q = search.trim().toLowerCase()
    if (q) {
      result = result.filter(t => t.name?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
    }
    if (activeCategory === 'all') return result
    if (activeCategory === 'mine') {
      return result.filter(t => t.members?.some(m => m.userId === user?.id || m.username?.toLowerCase() === user?.username?.toLowerCase()))
    }
    if (activeCategory === 'favorites') return result.filter(t => favorites.includes(t.id))
    return result.filter(t => detectTeamCategory(t, user?.id) === activeCategory)
  }, [teams, search, activeCategory, user, favorites])

  // ── Aggregate stats ──
  const totalTasks = useMemo(() => Object.values(teamStatsMap).reduce((s, v) => s + v.taskCount, 0), [teamStatsMap])
  const totalProjects = useMemo(() => Object.values(teamStatsMap).reduce((s, v) => s + v.projectCount, 0), [teamStatsMap])
  const myTeamsCount = useMemo(() =>
    teams.filter(t => t.members?.some(m => m.userId === user?.id || m.username?.toLowerCase() === user?.username?.toLowerCase())).length
  , [teams, user])

  // ── Toggle compare team ──
  const handleToggleCompare = useCallback((team) => {
    setCompareTeams(prev => {
      const exists = prev.find(t => t.id === team.id)
      if (exists) return prev.filter(t => t.id !== team.id)
      if (prev.length >= 3) {
        toast.warning('You can compare up to 3 teams at once')
        return prev
      }
      return [...prev, team]
    })
  }, [])

  // ── Quick create with template ──
  const handleQuickCreate = useCallback(({ name, description, template }) => {
    // Open the existing CreateTeamModal – the actual API call is handled there.
    // We pre-populate via localStorage or by passing context (the modal is opened, team created manually).
    // For now, show the create modal and toast the template info.
    toast.success(`"${name}" will be created with the "${template?.title}" template`, {
      description: 'Configure the team in the dialog.',
    })
    setCreateTeamModalOpen(true)
  }, [])

  const pageState = teamsError ? 'error' : teamsLoading ? 'loading' : 'ready'
  const isTeamEmpty = teams.length === 0

  if (workspaceMode === 'PERSONAL') {
    return <Navigate to="/app" replace />
  }

  // While organizations are still loading, activeOrganization is legitimately
  // null — redirecting here would kick a reloading user out of the page
  // (the "reload loses context" bug). Only bounce once loading is done.
  if (!activeOrganization) {
    if (loadingWorkspace) {
      return (
        <PageShell maxWidth="default">
          <PageContent>
            <div className="flex items-center justify-center py-24">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </PageContent>
        </PageShell>
      )
    }
    return <Navigate to="/app" replace />
  }

  return (
    <PageShell maxWidth="default">
      {/* ── Page Hero ── */}
      <PageHero
        eyebrow={`Teams · ${activeOrganization?.name || ''}`}
        title="Teams"
        subtitle="Organize work, track progress, and collaborate across divisions"
      >
        <div className="flex items-center gap-2">
          {canCreateTeam && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setQuickCreateOpen(true)}
              className="shadow-sm gap-1.5 h-8 text-[12px]"
            >
              <Icons.plus className="w-3.5 h-3.5" />
              New Team
            </Button>
          )}
          {!isTeamEmpty && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant={compareMode ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => {
                  setCompareMode(!compareMode)
                  if (compareMode) setCompareTeams([])
                }}
                className="gap-1.5 h-8 text-[12px]"
              >
                <Icons.scale className="w-3.5 h-3.5" />
                {compareMode ? 'Done Comparing' : 'Compare'}
              </Button>
            </motion.div>
          )}
        </div>
      </PageHero>

      {/* ── KPI Strip ── */}
      {!isTeamEmpty && (
        <EntityStatStrip
          stats={[
            { key: 'total', label: 'Total Teams', value: <AnimatedCounter value={teams.length} />, icon: Icons.users, tone: 'cyan' },
            { key: 'projects', label: 'Active Projects', value: <AnimatedCounter value={totalProjects} />, icon: Icons.folder, tone: 'amber' },
            { key: 'tasks', label: 'Open Tasks', value: <AnimatedCounter value={totalTasks} />, icon: Icons.checkSquare, tone: 'rose' },
            { key: 'mine', label: 'My Teams', value: <AnimatedCounter value={myTeamsCount} />, icon: Icons.userCheck || Icons.users, tone: 'emerald' },
          ]}
        />
      )}

      {/* ── Smart Categorization Bar + Search ── */}
      {!isTeamEmpty && (
        <EntityFilterBar
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Search teams by name or description..."
          chips={[
            { id: 'all', label: 'All Teams', count: categoryCounts.all },
            { id: 'mine', label: 'My Teams', count: categoryCounts.mine },
            ...(categoryCounts.engineering > 0 ? [{ id: 'engineering', label: 'Engineering', count: categoryCounts.engineering }] : []),
            ...(categoryCounts.design > 0 ? [{ id: 'design', label: 'Design', count: categoryCounts.design }] : []),
            ...(categoryCounts.marketing > 0 ? [{ id: 'marketing', label: 'Marketing', count: categoryCounts.marketing }] : []),
            { id: 'favorites', label: 'Favorites', count: categoryCounts.favorites },
          ]}
          activeChip={activeCategory}
          onChip={setActiveCategory}
        />
      )}

      {/* ── Compare mode banner ── */}
      <AnimatePresence>
        {compareMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 mx-4 mb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icons.scale className="w-4 h-4 text-[var(--accent)]" />
                <Text size="sm" className="font-medium text-[var(--text-primary)]">
                  {compareTeams.length === 0
                    ? 'Select teams to compare (max 3)'
                    : `${compareTeams.length} team${compareTeams.length > 1 ? 's' : ''} selected`}
                </Text>
                <div className="flex -space-x-1">
                  {compareTeams.map(t => (
                    <TeamAvatar key={t.id} name={t.name} size="sm" hue={hashHue(t.name)} />
                  ))}
                </div>
              </div>
              {compareTeams.length > 0 && (
                <Button variant="ghost" size="xs" onClick={() => setCompareTeams([])} className="text-[11px]">
                  Clear selection
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Content ── */}
      <PageContent>
        <PageState state={pageState} moduleId="teams" stateProps={{skeleton: (<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] items-start">{<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <TeamTileSkeleton key={i} />)}</div>}<Skeleton className="h-96 rounded-2xl" /></div>),  loadingVariant: 'cards', onAction: canCreateTeam ? () => setQuickCreateOpen(true) : undefined }}>
          {/* ── Loading State ── */}
          {pageState === 'loading' && (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                >
                  <TeamTileSkeleton />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ── Empty State ── */}
          {pageState === 'ready' && isTeamEmpty && (
            <EmptyState
              onClickCreate={() => setQuickCreateOpen(true)}
              organizationName={activeOrganization?.name}
            />
          )}

          {/* ── No Results ── */}
          {pageState === 'ready' && !isTeamEmpty && filteredTeams.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 border border-dashed border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-card)]"
            >
              <div className="w-14 h-14 rounded-2xl bg-[var(--bg-subtle)] flex items-center justify-center mx-auto mb-4">
                <Icons.search className="w-6 h-6 text-[var(--text-muted)]" />
              </div>
              <Heading level={3} className="text-[14px] font-semibold text-[var(--text-primary)]">
                No teams match <span className="text-[var(--accent)]">"{search}"</span>
              </Heading>
              <Text variant="muted" size="xs" className="mt-1">
                Try a different search or switch categories.
              </Text>
              <div className="mt-4 flex items-center justify-center gap-2">
                {search && (
                  <Button variant="ghost" size="xs" onClick={() => setSearch('')}>Clear search</Button>
                )}
                {activeCategory !== 'all' && (
                  <Button variant="ghost" size="xs" onClick={() => setActiveCategory('all')}>Show all teams</Button>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Team Gallery Grid ── */}
          {pageState === 'ready' && !isTeamEmpty && filteredTeams.length > 0 && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory + search}
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } } }}
                className="ec-grid"
              >
                {filteredTeams.map(team => (
                  <TeamTile
                    key={team.id}
                    team={team}
                    stats={teamStatsMap[team.id] || { taskCount: 0, projectCount: 0, doneCount: 0, completionRate: 0, activeTaskCount: 0 }}
                    isMember={team.members?.some(m => m.userId === user?.id || m.username?.toLowerCase() === user?.username?.toLowerCase())}
                    orgId={orgId}
                    canManage={canManage}
                    canManageTeam={canManageTeam}
                    navigate={navigate}
                    setSelectedTeam={setSelectedTeam}
                    isSelected={compareTeams.some(t => t.id === team.id)}
                    compareMode={compareMode}
                    onToggleCompare={handleToggleCompare}
                    isFavorite={favorites.includes(team.id)}
                    onToggleFavorite={() => toggleFavorite(team.id)}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </PageState>
      </PageContent>

      {/* ── Activity Sidebar ── */}
      {!isTeamEmpty && (
        <ActivitySidebar
          teams={teams}
          statsMap={teamStatsMap}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(prev => !prev)}
        />
      )}

      {/* ── Compare Panel (bottom drawer) ── */}
      <AnimatePresence>
        {compareMode && compareTeams.length >= 2 && (
          <ComparePanel
            teams={compareTeams}
            statsMap={teamStatsMap}
            onClose={() => { setCompareMode(false); setCompareTeams([]) }}
          />
        )}
      </AnimatePresence>

      {/* ── Quick Create Modal ── */}
      <QuickCreateModal
        isOpen={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        onCreateWithTemplate={handleQuickCreate}
      />

      {/* ── Existing modals (kept for backward compat) ── */}
      <CreateTeamModal isOpen={createTeamModalOpen} onClose={() => setCreateTeamModalOpen(false)} orgId={orgId} />
      <ManageTeamMembersModal isOpen={!!selectedTeam} onClose={() => setSelectedTeam(null)} team={teams.find(t => t.id === selectedTeam?.id) || selectedTeam} orgMembers={members} />
    </PageShell>
  )
}

export default TeamsPage
