import { useState, useRef, useEffect } from 'react';

function SearchBar({ placeholder, onSearch, onReset }) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef();
  const wrapperRef = useRef();

  useEffect(() => {
    if (expanded && inputRef.current) inputRef.current.focus();
  }, [expanded]);

  useEffect(() => {
    function handleClickOutside(event) {
      // Ignore clicks inside search wrapper
      if (wrapperRef.current && wrapperRef.current.contains(event.target)) return;

      // Ignore clicks inside movie or person cards
      if (event.target.closest(".movie-card") || event.target.closest(".person-card")) return;

      // Collapse search if clicked outside
      setExpanded(false);
      setQuery('');
      if (onReset) onReset();
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onReset]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && onSearch) onSearch(query);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (onSearch) onSearch(value);
  };

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'relative', display: 'inline-block', marginLeft: 'auto' }}
    >
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          style={{ fontSize: '20px', padding: '6px 10px', cursor: 'pointer', background: 'none', border: 'none' }}
          title="Search"
        >
          🔍
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleChange}
            style={{ padding: '6px', fontSize: '16px', width: '200px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button
            type="submit"
            style={{ padding: '6px 12px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#6b14bd', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              setQuery('');
              if (onReset) onReset();
            }}
            style={{ fontSize: '18px', padding: '4px 8px', cursor: 'pointer', background: 'none', border: 'none', color: 'red' }}
          >
            ✖
          </button>
        </form>
      )}
    </div>
  );
}

export default SearchBar;
