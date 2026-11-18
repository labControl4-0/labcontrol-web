import { ChevronRight, ChevronLeft, Cpu, AlertTriangle, Scan } from 'lucide-react';
import { useState } from 'react';
import { Machine } from '@/types/editor';

interface DashboardPanelProps {
  machines: Machine[];
}

const statusColors: Record<Machine['status'], string> = {
  active: 'bg-status-active',
  warning: 'bg-status-warning',
  error: 'bg-status-error',
};

const statusLabels: Record<Machine['status'], string> = {
  active: 'Active',
  warning: 'Warning',
  error: 'Error',
};

const DashboardPanel = ({ machines }: DashboardPanelProps) => {
  const [expanded, setExpanded] = useState(true);

  const activeCount = machines.filter((m) => m.status === 'active').length;
  const warningCount = machines.filter((m) => m.status === 'warning').length;
  const errorCount = machines.filter((m) => m.status === 'error').length;

  if (!expanded) {
    return (
      <div className="fixed right-3 top-16 z-40 toolbar-island flex flex-col items-center gap-1 p-1.5">
        <button
          onClick={() => setExpanded(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="h-px bg-border w-full my-0.5" />
        <div className="flex flex-col items-center gap-2 py-1">
          <div className="relative">
            <Cpu size={16} className="text-muted-foreground" />
            <span className="absolute -top-1 -right-1 w-3 h-3 text-[8px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              {machines.length}
            </span>
          </div>
          {warningCount > 0 && (
            <div className="w-2 h-2 rounded-full bg-status-warning" />
          )}
          {errorCount > 0 && (
            <div className="w-2 h-2 rounded-full bg-status-error" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed right-3 top-16 bottom-3 z-40 w-64 toolbar-island flex flex-col animate-slide-in-right">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Dashboard</h3>
        <button
          onClick={() => setExpanded(false)}
          className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 p-3 border-b border-border">
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">{activeCount}</div>
          <div className="text-[10px] text-muted-foreground">Active</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-status-warning">{warningCount}</div>
          <div className="text-[10px] text-muted-foreground">Warnings</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-status-error">{errorCount}</div>
          <div className="text-[10px] text-muted-foreground">Errors</div>
        </div>
      </div>

      {/* Machine List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">
          Machines ({machines.length})
        </div>
        <div className="flex flex-col gap-0.5">
          {machines.map((machine) => (
            <div
              key={machine.id}
              className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
            >
              <div className={`w-2 h-2 rounded-full ${statusColors[machine.status]} shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground truncate">{machine.name}</div>
              </div>
              <span className="text-[10px] text-muted-foreground">{statusLabels[machine.status]}</span>
            </div>
          ))}
          {machines.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-6">
              No machines placed yet.
              <br />
              Use the machine tool to add one.
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {(warningCount > 0 || errorCount > 0) && (
        <div className="border-t border-border p-3">
          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Alerts</div>
          {machines
            .filter((m) => m.status !== 'active')
            .map((m) => (
              <div key={m.id} className="flex items-center gap-2 text-xs py-1">
                <AlertTriangle size={12} className={m.status === 'error' ? 'text-status-error' : 'text-status-warning'} />
                <span className="text-foreground">{m.name}</span>
              </div>
            ))}
        </div>
      )}

      {/* AR Button */}
      <div className="p-3 border-t border-border">
        <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-secondary text-foreground text-xs font-medium hover:bg-accent transition-colors">
          <Scan size={14} />
          View in AR
        </button>
      </div>
    </div>
  );
};

export default DashboardPanel;
