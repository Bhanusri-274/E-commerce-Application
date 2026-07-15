import { Search, X } from "lucide-react";
import { useState } from "react";
import useDebounce from "../../hooks/useDebounce";
import { useEffect } from "react";

const SearchInput = ({ placeholder = "Search…", onSearch, className = "" }) => {
  const [value, setValue] = useState("");
  const debounced = useDebounce(value, 400);

  useEffect(() => {
    onSearch(debounced);
  }, [debounced]); // eslint-disable-line

  return (
    <div className={`relative ${className}`}>
      <Search
        size={15}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
      />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="input-field !py-2.5 pl-10 pr-9"
      />
      {value && (
        <button
          onClick={() => setValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
