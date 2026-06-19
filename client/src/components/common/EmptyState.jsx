const EmptyState = ({ title, description, action }) => (
  <div className="card flex flex-col items-center px-6 py-16 text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
      🛍️
    </div>
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    {description && <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;
