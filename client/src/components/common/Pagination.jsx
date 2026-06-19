const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  const pagesToShow = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pages || Math.abs(p - page) <= 1
  );

  return (
    <div className="mt-8 flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="btn-secondary px-3 py-2 text-sm disabled:opacity-40"
      >
        Prev
      </button>

      {pagesToShow.map((p, idx) => {
        const prev = pagesToShow[idx - 1];
        const showEllipsis = prev && p - prev > 1;

        return (
          <span key={p} className="flex items-center gap-1">
            {showEllipsis && <span className="px-2 text-slate-400">…</span>}
            <button
              onClick={() => onPageChange(p)}
              className={`min-w-[40px] rounded-lg px-3 py-2 text-sm font-medium transition ${
                p === page
                  ? 'bg-brand-600 text-white'
                  : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          </span>
        );
      })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        className="btn-secondary px-3 py-2 text-sm disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
