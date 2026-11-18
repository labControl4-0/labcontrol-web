import { MousePointer2, Pen, Square, Cpu, Grid3X3, Undo2, Redo2 } from 'lucide-react';
import { Tool } from '@/types/editor';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface LeftToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  gridEnabled: boolean;
  onToggleGrid: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const LeftToolbar = ({
  activeTool,
  onToolChange,
  gridEnabled,
  onToggleGrid,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: LeftToolbarProps) => {
  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: 'select', icon: <MousePointer2 size={18} />, label: 'Select (V)' },
    { id: 'draw', icon: <Pen size={18} />, label: 'Draw Line (D)' },
    { id: 'sector', icon: <Square size={18} />, label: 'Create Sector (S)' },
    { id: 'machine', icon: <Cpu size={18} />, label: 'Add Machine (M)' },
  ];

  return (
    <div className="fixed left-3 top-1/2 -translate-y-1/2 z-40 toolbar-island flex flex-col gap-0.5 p-1.5">
      {tools.map((tool) => (
        <Tooltip key={tool.id} delayDuration={300}>
          <TooltipTrigger asChild>
            <button
              onClick={() => onToolChange(tool.id)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${
                activeTool === tool.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {tool.icon}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {tool.label}
          </TooltipContent>
        </Tooltip>
      ))}

      <div className="h-px bg-border my-1" />

      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button
            onClick={onToggleGrid}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${
              gridEnabled
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            <Grid3X3 size={18} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          Toggle Grid (G)
        </TooltipContent>
      </Tooltip>

      <div className="h-px bg-border my-1" />

      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none"
          >
            <Undo2 size={18} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          Undo (⌘Z)
        </TooltipContent>
      </Tooltip>

      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none"
          >
            <Redo2 size={18} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          Redo (⌘⇧Z)
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default LeftToolbar;
