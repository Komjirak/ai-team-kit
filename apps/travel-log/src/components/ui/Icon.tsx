import {
  ArrowLeft,
  ArrowLeftRight,
  Award,
  BookOpen,
  BookText,
  Bell,
  CalendarDays,
  Info,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  Circle,
  Coffee,
  Copy,
  Footprints,
  Frown,
  Heart,
  Hotel,
  History,
  HelpCircle,
  Home,
  Image as ImageIcon,
  ImagePlus,
  Images,
  LayoutGrid,
  Link as LinkIcon,
  LineChart,
  LogIn,
  LogOut,
  Luggage,
  Map as MapIcon,
  MapPin,
  MapPinPlus,
  MoreHorizontal,
  Navigation,
  Pencil,
  Plus,
  RefreshCw,
  Ruler,
  Save,
  Search,
  Settings,
  Share,
  Sparkles,
  Trash2,
  Trees,
  Upload,
  UserPlus,
  Users,
  UserCircle,
  Utensils,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// Inline SVG icon set (Lucide) — rounded, gel-pen line quality that
// matches the "Dakku" scrapbook system. No external icon font, so icons
// always render (no ligature-text fallback when a font is blocked/slow).
//
// The `name` keys are kept stable so every call site stays unchanged.
// ─────────────────────────────────────────────────────────────

const MAP: Record<string, LucideIcon> = {
  account_circle: UserCircle,
  add: Plus,
  add_a_photo: ImagePlus,
  add_location_alt: MapPinPlus,
  arrow_back: ArrowLeft,
  auto_awesome: Sparkles,
  auto_stories: BookOpen,
  check: Check,
  chevron_right: ChevronRight,
  circle: Circle,
  close: X,
  content_copy: Copy,
  delete: Trash2,
  directions: Navigation,
  directions_run: Footprints,
  edit: Pencil,
  event: CalendarDays,
  calendar_month: CalendarDays,
  info: Info,
  expand_more: ChevronDown,
  favorite: Heart,
  grid_view: LayoutGrid,
  group: Users,
  group_add: UserPlus,
  history: History,
  home: Home,
  hotel: Hotel,
  image: ImageIcon,
  ios_share: Share,
  keyboard_arrow_down: ChevronDown,
  keyboard_arrow_up: ChevronUp,
  link: LinkIcon,
  local_cafe: Coffee,
  location_on: MapPin,
  login: LogIn,
  logout: LogOut,
  luggage: Luggage,
  map: MapIcon,
  menu_book: BookText,
  monitoring: LineChart,
  more_horiz: MoreHorizontal,
  notifications: Bell,
  park: Trees,
  photo_camera: Camera,
  photo_library: Images,
  place: MapPin,
  refresh: RefreshCw,
  restaurant: Utensils,
  save: Save,
  search: Search,
  sentiment_dissatisfied: Frown,
  settings: Settings,
  straighten: Ruler,
  swap_horiz: ArrowLeftRight,
  unfold_more: ChevronsUpDown,
  upload: Upload,
  wallet: Wallet,
  workspace_premium: Award,
}

/** A 간직.log icon. `fill` fills the glyph (used for the brand heart / active tabs). */
export function Icon({
  name,
  className = '',
  size = 24,
  fill,
}: {
  name: string
  className?: string
  size?: number
  fill?: boolean
}) {
  const C = MAP[name] ?? HelpCircle
  return (
    <C
      size={size}
      className={`inline-block shrink-0 ${className}`}
      strokeWidth={2}
      fill={fill ? 'currentColor' : 'none'}
      aria-hidden="true"
    />
  )
}
