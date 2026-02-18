import { Search } from 'lucide-react';

export default function SearchInputFallback({ label, placeholder }) {
  return (
    <div className="relative flex items-center gap-2" aria-hidden="true">
      <label className="sr-only">{label}</label>
      <input
        type="search"
        placeholder={placeholder}
        className="border-2 border-red-600 text-red-600 rounded-lg font-medium w-10 lg:w-[20rem] lg:pe-4 ps-10 py-2 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
        readOnly
        disabled
      />
      <button
        type="button"
        className="absolute start-3 top-1/2 transform -translate-y-1/2"
        aria-label={label}
        disabled
      >
        <Search className="w-5 h-5 text-red-600" />
      </button>
    </div>
  );
}
