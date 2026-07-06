import {
  BookOpen,
  Boxes,
  FileText,
  FolderKanban,
  KeyRound,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  Wrench
} from 'lucide-react'

const iconMap = {
  BookOpen,
  Boxes,
  FileText,
  FolderKanban,
  KeyRound,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  Wrench
}

type IconName = keyof typeof iconMap

export function IconBadge({ icon = 'BookOpen' }: { icon?: string }) {
  const Icon = iconMap[(icon as IconName) || 'BookOpen'] || BookOpen
  return (
    <span className="card-icon">
      <Icon size={24} />
    </span>
  )
}
