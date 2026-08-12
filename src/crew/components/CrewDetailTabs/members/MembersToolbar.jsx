import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/Select';
import { SearchInput } from '@/shared/ui/SearchInput';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import { LayoutGrid, List, UserPlus, Link2 } from '@/shared/ui/Icons';

// Controls: Search, Role Filter, View Switcher & Action Buttons
export function MembersToolbar({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  viewMode,
  onViewModeChange,
  onInvite,
  onGenerateInviteLink,
  isInviteLinkPending,
  isLinkCopied,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Search Input */}
      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search members or email..."
        debounceMs={0}
        className="flex-1 sm:w-60 min-w-[180px]"
      />

      {/* Role Filter using shared Select component */}
      <Select value={roleFilter} onValueChange={onRoleFilterChange}>
        <SelectTrigger className="h-8 w-[130px] text-xs font-medium bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg shadow-sm">
          <SelectValue placeholder="All Roles" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="ALL">All Roles</SelectItem>
          <SelectItem value="OWNER">Owners</SelectItem>
          <SelectItem value="ADMIN">Admins</SelectItem>
          <SelectItem value="MEMBER">Members</SelectItem>
        </SelectContent>
      </Select>

      {/* View Switcher Toggle */}
      <div className="flex items-center h-8 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-lg p-0.5">
        <button
          onClick={() => onViewModeChange('grid')}
          className={cn(
            'h-7 px-2.5 rounded-md transition-colors flex items-center gap-1 font-medium',
            viewMode === 'grid'
              ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          )}
          title="Grid Cards View"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onViewModeChange('table')}
          className={cn(
            'h-7 px-2.5 rounded-md transition-colors flex items-center gap-1 font-medium',
            viewMode === 'table'
              ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          )}
          title="Compact Table View"
        >
          <List className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Invite Buttons */}
      <Button
        size="sm"
        className="h-8 text-[12px] font-semibold gap-1.5"
        onClick={onInvite}
      >
        <UserPlus className="w-3.5 h-3.5" />
        Invite
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-8 text-[12px] font-semibold gap-1.5 border-dashed"
        onClick={onGenerateInviteLink}
        isLoading={isInviteLinkPending}
      >
        <Link2 className="w-3.5 h-3.5" />
        {isLinkCopied ? 'Copied Link' : 'Invite Link'}
      </Button>
    </div>
  );
}
