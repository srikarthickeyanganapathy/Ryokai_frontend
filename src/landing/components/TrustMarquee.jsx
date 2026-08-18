import { motion, useReducedMotion, useAnimationControls } from 'framer-motion';
import { Lock, Shield, FileText, Users, Clock } from 'lucide-react';
import { useEffect } from 'react';

const marqueeItems = [
  { text: "Multi-tenant isolation", icon: Lock },
  { text: "Role-based access", icon: Shield },
  { text: "Full audit log", icon: FileText },
  { text: "Personal · Org · Crews", icon: Users },
  { text: "Request → Membership → Ownership → RBAC → Policies → GRANT / DENY", icon: Shield },
  { text: "Focus & deep work", icon: Clock },
];

export default function TrustMarquee() {
  const shouldReduceMotion = useReducedMotion();
  const controls = useAnimationControls();

  useEffect(() => {
    if (!shouldReduceMotion) {
      controls.start({
        x: ["0%", "-50%"],
        transition: {
          repeat: Infinity,
          ease: "linear",
          duration: 40,
        }
      });
    }
  }, [shouldReduceMotion, controls]);

  const marqueeContent = (
    <div className="mg">
      {marqueeItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <span key={idx} className="mi">
            <Icon size={18} className="mr-2" /> {item.text}
            <span className="dot mx-4 opacity-50">·</span>
          </span>
        );
      })}
    </div>
  );

  return (
    <div className="trust overflow-hidden whitespace-nowrap">
      <div 
        className="marquee"
        onMouseEnter={() => !shouldReduceMotion && controls.stop()}
        onMouseLeave={() => !shouldReduceMotion && controls.start({
          x: ["0%", "-50%"],
          transition: {
            repeat: Infinity,
            ease: "linear",
            duration: 40,
          }
        })}
      >
        <motion.div
          className="flex w-fit"
          animate={controls}
        >
          {marqueeContent}
          {marqueeContent}
          {marqueeContent}
          {marqueeContent}
        </motion.div>
      </div>
    </div>
  );
}
