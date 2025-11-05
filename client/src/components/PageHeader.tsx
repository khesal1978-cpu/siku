import { Link } from 'wouter';
import { Settings } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="p-6 pt-8 pb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
          {subtitle && <p className="text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <Link href="/settings" data-testid="link-settings">
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-md hover:shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all" data-testid="button-settings">
            <Settings className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </Link>
      </div>
    </header>
  );
}
