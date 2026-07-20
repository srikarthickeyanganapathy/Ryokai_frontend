import React from 'react'
import { motion } from 'framer-motion'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { useOrgMembers } from '@/features/organizations/hooks/useOrganizations'
import { Heading, Text } from '@/shared/ui/Typography'
import { Search, Mail, Shield, User as UserIcon } from 'lucide-react'
import { useState, useMemo } from 'react'
import { cn } from '@/shared/lib/cn'

export function DirectoryPage() {
  const { activeOrganization } = useWorkspace()
  const { data: members = [], isLoading } = useOrgMembers(activeOrganization?.id)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const nameMatch = member.username?.toLowerCase().includes(searchQuery.toLowerCase())
      const roleMatch = member.orgRole?.toLowerCase().includes(searchQuery.toLowerCase())
      return nameMatch || roleMatch
    })
  }, [members, searchQuery])

  if (!activeOrganization) return null

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="h-full px-6 py-8 md:px-10 lg:px-12 max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6"
        >
          <div>
            <Heading level={2} className="tracking-tight text-[24px] font-semibold text-white/90">
              Directory
            </Heading>
            <Text variant="muted" className="text-[14px] mt-1">
              {members.length} members in {activeOrganization.name}
            </Text>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
        </motion.div>

        {/* Directory Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-white/5 border border-white/5 rounded-xl h-24" />
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-2xl border-dashed">
            <UserIcon className="h-10 w-10 text-white/20 mx-auto mb-4" />
            <Heading level={4} className="text-white/60 mb-2">No members found</Heading>
            <Text variant="muted" className="text-sm">Try adjusting your search criteria</Text>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.userId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white/[0.03] border border-white/10 hover:border-white/20 rounded-xl p-5 transition-all duration-300 hover:bg-white/[0.05]"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar Avatar */}
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-medium text-white/80">
                      {member.username?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Heading level={4} className="truncate text-base font-medium text-white/90">
                        {member.username}
                      </Heading>
                      {/* Priority Badge */}
                      <div className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wider uppercase whitespace-nowrap",
                        member.rolePriority === 0 ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        member.rolePriority === 1 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-white/5 text-white/50 border border-white/10"
                      )}>
                        {member.orgRole}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-white/50 truncate">
                      <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{member.username}@ryokai.app</span>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                        <Shield className="h-3 w-3" />
                        Priority {member.rolePriority ?? 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
