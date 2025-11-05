import { Link } from 'wouter';
import { Settings as SettingsIcon, ArrowLeft, Shield, HelpCircle, Twitter } from 'lucide-react';

export default function Settings() {
  const userProfile = {
    name: "Satoshi Nakamoto",
    email: "satoshi@pingcaset.com",
    avatar: "SN"
  };

  return (
    <div className="min-h-screen bg-[#f6f8f7] dark:bg-[#10221a] pb-24">
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto p-4">
        <div className="flex items-center pt-4 pb-4" data-testid="header-settings">
          <Link href="/profile" data-testid="link-back">
            <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors" data-testid="button-back">
              <ArrowLeft className="w-6 h-6 text-[#111815] dark:text-[#e0e2e1]" />
            </button>
          </Link>
          <h1 className="flex-1 text-2xl font-bold text-center text-[#111815] dark:text-[#e0e2e1]">Settings</h1>
          <div className="w-10" />
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-[#1a2c23] p-4 rounded-xl shadow-sm mb-8" data-testid="card-profile">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
            {userProfile.avatar}
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-lg font-bold text-[#111815] dark:text-[#e0e2e1] line-clamp-1" data-testid="text-username">{userProfile.name}</p>
            <p className="text-sm text-[#618979] dark:text-[#a0a3a1] line-clamp-1" data-testid="text-email">{userProfile.email}</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-[#111815] dark:text-[#e0e2e1] px-2 pb-2 pt-4">Legal</h3>
            <div className="flex flex-col gap-2">
              <Link href="/terms" data-testid="link-terms">
                <button className="w-full flex items-center gap-4 bg-white dark:bg-[#1a2c23] px-4 min-h-14 rounded-lg shadow-sm hover:bg-[#f6f8f7] dark:hover:bg-[#10221a] transition-colors" data-testid="button-terms">
                  <div className="flex items-center justify-center rounded-lg bg-primary/20 w-10 h-10 shrink-0">
                    <Shield className="w-5 h-5 text-[#111815] dark:text-[#e0e2e1]" />
                  </div>
                  <p className="flex-1 text-base font-medium text-[#111815] dark:text-[#e0e2e1] text-left truncate">Terms & Privacy Policy</p>
                  <div className="shrink-0">
                    <svg className="w-6 h-6 text-[#618979] dark:text-[#a0a3a1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#111815] dark:text-[#e0e2e1] px-2 pb-2 pt-4">Support</h3>
            <div className="flex flex-col gap-2">
              <Link href="/help" data-testid="link-help">
                <button className="w-full flex items-center gap-4 bg-white dark:bg-[#1a2c23] px-4 min-h-14 rounded-lg shadow-sm hover:bg-[#f6f8f7] dark:hover:bg-[#10221a] transition-colors" data-testid="button-help">
                  <div className="flex items-center justify-center rounded-lg bg-primary/20 w-10 h-10 shrink-0">
                    <HelpCircle className="w-5 h-5 text-[#111815] dark:text-[#e0e2e1]" />
                  </div>
                  <p className="flex-1 text-base font-medium text-[#111815] dark:text-[#e0e2e1] text-left truncate">Help Center</p>
                  <div className="shrink-0">
                    <svg className="w-6 h-6 text-[#618979] dark:text-[#a0a3a1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#111815] dark:text-[#e0e2e1] px-2 pb-2 pt-4">Community</h3>
            <div className="flex flex-col gap-4 bg-white dark:bg-[#1a2c23] p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center rounded-lg bg-[#1DA1F2]/20 w-10 h-10 shrink-0">
                  <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-[#111815] dark:text-[#e0e2e1]">Follow us on Twitter</p>
                  <p className="text-sm font-medium text-[#618979] dark:text-[#a0a3a1]">@PingCaset</p>
                </div>
                <div className="bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary font-semibold px-3 py-1 text-xs rounded-full whitespace-nowrap">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
