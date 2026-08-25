import {
  Database,
  Binary,
  Boxes,
  Code2,
  Network,
  Cpu,
  ShieldAlert,
  Terminal,
  BrainCircuit,
  Globe,
  Layers,
  Sparkles,
} from "lucide-react";

interface CategoryIconProps {
  name: string;
  className?: string;
}

export function CategoryIcon({ name, className = "w-5 h-5" }: CategoryIconProps) {
  switch (name) {
    case "Database":
      return <Database className={className} />;
    case "Binary":
      return <Binary className={className} />;
    case "Boxes":
      return <Boxes className={className} />;
    case "Code2":
      return <Code2 className={className} />;
    case "Network":
      return <Network className={className} />;
    case "Cpu":
      return <Cpu className={className} />;
    case "ShieldAlert":
      return <ShieldAlert className={className} />;
    case "Terminal":
      return <Terminal className={className} />;
    case "BrainCircuit":
      return <BrainCircuit className={className} />;
    case "Globe":
      return <Globe className={className} />;
    default:
      return <Layers className={className} />;
  }
}
