import { useState } from 'react';
import { SectorType } from '@/types/editor';

interface SectorModalProps {
  position: { x: number; y: number };
  onConfirm: (name: string, color: string, type: SectorType) => void;
  onCancel: () => void;
}

const SECTOR_COLORS = ['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FF3B30', '#5AC8FA', '#FFD60A', '#FF6482'];

const SECTOR_TYPES: { id: SectorType; label: string }[] = [
  { id: 'laboratory', label: 'Laboratory' },
  { id: 'industrial', label: 'Industrial Area' },
  { id: 'corridor', label: 'Corridor' },
  { id: 'storage', label: 'Storage' },
  { id: 'custom', label: 'Custom' },
];

const SectorModal = ({ position, onConfirm, onCancel }: SectorModalProps) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(SECTOR_COLORS[0]);
  const [type, setType] = useState<SectorType>('custom');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name.trim(), color, type);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50" onClick={onCancel} />
      <div
        className="fixed z-50 w-64 toolbar-island p-4 animate-scale-in"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Sector Name
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Assembly Line A"
              className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
            />
          </div>

          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Color</label>
            <div className="flex gap-1.5 mt-1.5">
              {SECTOR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-all duration-200 ${
                    color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Type</label>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {SECTOR_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-200 ${
                    type === t.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 rounded-lg bg-secondary text-muted-foreground text-xs font-medium hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium disabled:opacity-40 transition-opacity"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SectorModal;
