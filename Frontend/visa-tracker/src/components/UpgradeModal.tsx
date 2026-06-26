interface UpgradeModalProps {
  open: boolean
  reason: string
  upgrading: boolean
  onClose: () => void
  onUpgrade: () => void
}

function UpgradeModal({ open, reason, upgrading, onClose, onUpgrade }: UpgradeModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-100 flex items-center justify-center p-gutter"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-surface-container-lowest w-full max-w-sm rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-stack-md">
            <span className="material-symbols-outlined text-white">workspace_premium</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-primary mb-stack-sm">
            Upgrade to Pro
          </h2>
          <p className="text-on-surface-variant font-body-sm mb-stack-md">{reason}</p>
          <ul className="text-left font-body-sm text-on-surface-variant mb-stack-md space-y-1">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-secondary">check</span>
              Unlimited visa applications
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-secondary">check</span>
              Chat with Advisor on any application
            </li>
          </ul>
          <div className="flex gap-stack-md">
            <button
              className="flex-1 px-4 py-2 border border-primary text-primary rounded font-medium hover:bg-surface-container transition-colors"
              onClick={onClose}
              disabled={upgrading}
            >
              Not now
            </button>
            <button
              className="flex-1 px-4 py-2 bg-primary text-on-primary rounded font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 text-white"
              onClick={onUpgrade}
              disabled={upgrading}
            >
              {upgrading ? 'Upgrading...' : 'Upgrade Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpgradeModal
