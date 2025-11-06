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
      </div>
    </header>
  );
}
