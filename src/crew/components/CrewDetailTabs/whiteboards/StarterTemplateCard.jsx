import { motion } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { ArrowRight } from '@/shared/ui/Icons';

// Starter Gallery Template Item Component
export function StarterTemplateCard({ template, onSelect }) {
  const IconComponent = template.icon;
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(template.id)}
      className="group relative text-left bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-border)] hover:shadow-sm rounded-xl p-3.5 transition-all duration-200 shadow-xs flex flex-col justify-between overflow-hidden"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105" 
          style={{ backgroundColor: template.bgColor, color: template.accentColor }}
        >
          <IconComponent className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
          {template.category}
        </span>
      </div>

      <div>
        <Heading level={4} className="text-[13px] font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-1">
          {template.name}
        </Heading>
        <Text variant="muted" className="text-[11px] line-clamp-2 text-[var(--text-secondary)] leading-relaxed">
          {template.desc}
        </Text>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center text-[11px] font-medium text-[var(--accent)] group-hover:translate-x-0.5 transition-transform">
        <span>Use Template</span>
        <ArrowRight className="w-3 h-3 ml-1" />
      </div>
    </motion.button>
  );
}
