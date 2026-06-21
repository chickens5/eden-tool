import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { gsap } from 'gsap';
import './USReparations.css';
import Strands from './Strands';

const ROW_HEIGHT = 52;
const OVERSCAN = 10;
const CONTAINER_HEIGHT = 560;
const CHUNK_SIZE = 8000;

const COLUMNS = [
  { key: 'en_name', label: 'Name',          flex: 3   },
  { key: 'age',     label: 'Age',           flex: 0.8 },
  { key: 'sex',     label: 'Sex',           flex: 1   },
  { key: 'dob',     label: 'Date of Birth', flex: 1.5 },
  { key: 'update',  label: 'Batch',         flex: 0.8 },
];

export default function USReparations({ onBack }) {
  const [records, setRecords]           = useState([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadStage, setLoadStage]       = useState('Downloading…');
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  // Filters
  const [sexFilter,     setSexFilter]     = useState('all');
  const [ageMin,        setAgeMin]        = useState('');
  const [ageMax,        setAgeMax]        = useState('');

  const [updateFilter,  setUpdateFilter]  = useState('all');
  const [nameSearch,    setNameSearch]    = useState('');
  const [debouncedName, setDebouncedName] = useState('');
  const [sortKey,       setSortKey]       = useState('');
  const [sortDir,       setSortDir]       = useState('asc');
  const [scrollTop,     setScrollTop]     = useState(0);

  const scrollRef   = useRef(null);
  const wrapperRef  = useRef(null);
  const tableRef    = useRef(null);
  const debounceRef = useRef(null);

  // ── Load + parse ────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('./killed-in-gaza.csv');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        setLoadStage('Reading file…');
        const csvText = await response.text();
        setLoadProgress(20);
        setLoadStage('Parsing records…');

        await new Promise(r => setTimeout(r, 0)); // yield so progress bar renders

        const lines       = csvText.trim().split('\n');
        const headers     = lines[0].split(',').map(h => h.trim());
        const dataLines   = lines.slice(1);
        const total       = dataLines.length;
        const result      = [];

        const parseChunk = (start) =>
          new Promise(resolve => setTimeout(() => {
            const end = Math.min(start + CHUNK_SIZE, total);
            for (let i = start; i < end; i++) {
              const line = dataLines[i];
              if (!line) continue;
              const values = line.split(',');
              const obj = {};
              headers.forEach((h, j) => { obj[h] = (values[j] ?? '').trim(); });
              result.push(obj);
            }
            setLoadProgress(20 + Math.round((end / total) * 80));
            resolve(end);
          }, 0));

        let pos = 0;
        while (pos < total) pos = await parseChunk(pos);

        setRecords(result);
        setLoading(false);

        requestAnimationFrame(() => {
          if (wrapperRef.current) {
            gsap.from(wrapperRef.current.querySelectorAll('.stat-card'), {
              opacity: 0, y: 24, duration: 0.5, stagger: 0.07, ease: 'power2.out'
            });
          }
          gsap.from('.filters-section', { opacity: 0, y: 16, duration: 0.4, delay: 0.4, ease: 'power2.out' });
          gsap.from('.rep-table-wrapper', { opacity: 0, y: 28, duration: 0.5, delay: 0.55, ease: 'power2.out' });
        });
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    load();
  }, []);
  // ── Filtering + sorting ──────────────────────────────────────────────────────
  const filteredRecords = useMemo(() => {
    let data = records;
    if (sexFilter !== 'all')    data = data.filter(r => r.sex === sexFilter);
    if (ageMin !== '')           data = data.filter(r => +r.age >= +ageMin);
    if (ageMax !== '')           data = data.filter(r => +r.age <= +ageMax);
   
    
    if (updateFilter !== 'all') data = data.filter(r => r.update === updateFilter);
    if (debouncedName) {
      const q = debouncedName.toLowerCase();
      data = data.filter(r => r.en_name?.toLowerCase().includes(q));
    }
    if (sortKey) {
      const dir = sortDir === 'asc' ? 1 : -1;
      data = [...data].sort((a, b) => {
        let av = a[sortKey] ?? '', bv = b[sortKey] ?? '';
        if (sortKey === 'age') { av = +av || 0; bv = +bv || 0; }
        return av < bv ? -dir : av > bv ? dir : 0;
      });
    }
    return data;
  }, [records, sexFilter, ageMin, ageMax, updateFilter, debouncedName, sortKey, sortDir]);

  const stats = useMemo(() => {
    const total   = filteredRecords.length;
    const male    = filteredRecords.filter(r => r.sex === 'm').length;
    const female  = filteredRecords.filter(r => r.sex === 'f').length;
    const under18 = filteredRecords.filter(r => +r.age > 0 && +r.age < 18).length;
    const ages    = filteredRecords.map(r => +r.age).filter(a => a > 0 && a < 130);
    const avgAge  = ages.length
      ? (ages.reduce((s, a) => s + a, 0) / ages.length).toFixed(1)
      : '—';
    return { total, male, female, under18, avgAge };
  }, [filteredRecords]);


  // Flash table body whenever filtered results change
  useEffect(() => {
    if (!tableRef.current || !records.length) return;
    gsap.fromTo(tableRef.current, { opacity: 0.4 }, { opacity: 1, duration: 0.22, ease: 'power1.out' });
  }, [filteredRecords, records.length]);

  // Reset scroll position to top — called alongside filter setters so React 18
  // batches the state updates into a single render (no setState-in-effect cascade).
  const resetScroll = useCallback(() => {
    setScrollTop(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  // ── Debounced name search ────────────────────────────────────────────────────
  const handleNameChange = (e) => {
    setNameSearch(e.target.value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedName(e.target.value);
      resetScroll();
    }, 200);
  };


  
  // ── Virtual scroll math ──────────────────────────────────────────────────────
  const visibleStart = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const visibleEnd   = Math.min(
    filteredRecords.length,
    Math.ceil((scrollTop + CONTAINER_HEIGHT) / ROW_HEIGHT) + OVERSCAN
  );
  const visibleRows  = filteredRecords.slice(visibleStart, visibleEnd);
  const totalHeight  = filteredRecords.length * ROW_HEIGHT;
  const offsetY      = visibleStart * ROW_HEIGHT;

  const handleScroll = useCallback(e => setScrollTop(e.target.scrollTop), []);

  const handleSort = (key) => {
    setSortDir(prev => sortKey === key && prev === 'asc' ? 'desc' : 'asc');
    setSortKey(key);
    resetScroll();
  };

  const resetFilters = () => {
    setSexFilter('all'); setAgeMin(''); setAgeMax('');
   
    setNameSearch(''); setDebouncedName('');
    setSortKey(''); setSortDir('asc');
    resetScroll();
  };

  const activeFilterCount = [
    sexFilter !== 'all', ageMin, ageMax,
    
  ].filter(Boolean).length;

  // ── Loading screen ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="us-reparations">
        <div className="load-screen">
          <div className="load-title">Palestine Deaths Record</div>
          <div className="load-stage">{loadStage}</div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${loadProgress}%` }} />
          </div>
          <div className="progress-pct">{loadProgress}%</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="us-reparations">
        <div className="error">Error loading data: {error}</div>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────────
  return (
    <div style={{ width: '100%', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Full-screen background strands */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none'
      }}>
        <Strands
          colors={["#fcff8d","#e40000","#F97316"]}
          count={3}
          speed={0.3}
          amplitude={2.5}
          waviness={3}
          thickness={2.5}
          glow={2.6}
          taper={3}
          spread={3}
          intensity={0.6}
          saturation={1.05}
          opacity={0.8}
          scale={3}
          glass={false}
          refraction={1}
          dispersion={1}
          glassSize={1}
          hueShift={0.65}
        />
      </div>

      {/* Content overlay */}
      <div className="us-reparations" ref={wrapperRef} style={{ position: 'relative', zIndex: 1 }}>
      <header className="rep-header">
        {onBack && (
          <button className="back-btn" onClick={onBack}>← Back</button>
        )}
        <h1 className="rep-title">Palestine Deaths Record</h1>
        <img
          src="./t4p-logo.webp" alt="Palestine Deaths Record Logo" className="header-logo"
        />
        <p className="rep-subtitle">
          Data compiled from verified sources — {records.length.toLocaleString()} records
        </p>
      </header>

      {/* Stats */}
      <section className="stats-container">
        {[
          [stats.total.toLocaleString(),   'Matching Records'],
          [stats.male.toLocaleString(),    'Male'],
          [stats.female.toLocaleString(),  'Female'],
          [stats.under18.toLocaleString(), 'Under 18'],
          [stats.avgAge,                   'Avg Age'],
        ].map(([val, label]) => (
          <div className="stat-card" key={label}>
            <span className="stat-value">{val}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </section>

      {/* Filters */}
      <section className="filters-section">
        <div className="filters-row">

          <div className="filter-group">
            <label className="filter-label">Sex</label>
            <div className="toggle-group">
              {[['all', 'All'], ['m', 'Male'], ['f', 'Female']].map(([v, l]) => (
                <button
                  key={v}
                  className={`toggle-btn${sexFilter === v ? ' active' : ''}`}
                  onClick={() => { setSexFilter(v); resetScroll(); }}
                >{l}</button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label className="filter-label">Age Range</label>
            <div className="age-inputs">
              <input
                type="number" placeholder="Min" value={ageMin}
                onChange={e => { setAgeMin(e.target.value); resetScroll(); }} min="0" max="120"
              />
              <span className="age-sep">–</span>
              <input
                type="number" placeholder="Max" value={ageMax}
                onChange={e => { setAgeMax(e.target.value); resetScroll(); }} min="0" max="120"
              />
            </div>
          </div>

      

          <div className="filter-group filter-grow">
            <label className="filter-label">Search Name</label>
            <input
              type="text" placeholder="Filter by name…"
              value={nameSearch} onChange={handleNameChange}
            />
          </div>

          {activeFilterCount > 0 && (
            <button className="reset-btn" onClick={resetFilters}>
              ↺ Reset ({activeFilterCount})
            </button>
          )}
        </div>
      </section>

      {/* Table */}
      <section className="rep-table-wrapper">
        <div className="table-meta">
          <span className="table-count">
            {filteredRecords.length.toLocaleString()}
            {filteredRecords.length !== records.length && (
              <span className="table-of"> / {records.length.toLocaleString()}</span>
            )}
            {' records'}
          </span>
          {sortKey && (
            <span className="table-sort-info">
              sorted by {COLUMNS.find(c => c.key === sortKey)?.label} {sortDir === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>

        {/* Header */}
        <div className="rep-table-head">
          {COLUMNS.map(col => (
            <div
              key={col.key}
              className={`th th-${col.key}${sortKey === col.key ? ' th-sorted' : ''}`}
              style={{ flex: col.flex }}
              onClick={() => handleSort(col.key)}
            >
              {col.label}
              <span className="sort-icon">
                {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
              </span>
            </div>
          ))}
        </div>

        {/* Virtual scroll body */}
        <div
          className="rep-table-body"
          style={{ height: CONTAINER_HEIGHT }}
          onScroll={handleScroll}
          ref={scrollRef}
        >
          <div ref={tableRef} style={{ height: totalHeight, position: 'relative' }}>
            <div style={{ transform: `translateY(${offsetY}px)`, position: 'absolute', width: '100%' }}>
              {filteredRecords.length === 0 ? (
                <div className="table-empty">No records match the current filters.</div>
              ) : visibleRows.map((row, i) => (
                <div
                  key={row.id || `r-${visibleStart + i}`}
                  className={`tr${(visibleStart + i) % 2 === 1 ? ' tr-alt' : ''}`}
                  style={{ height: ROW_HEIGHT }}
                >
                  {COLUMNS.map(col => (
                    <div
                      key={col.key}
                      className={`td td-${col.key}${col.key === 'sex' ? ` sex-${row.sex}` : ''}`}
                      style={{ flex: col.flex }}
                    >
                      {col.key === 'en_name' ? (
                        <><span className="name-dot" />{row.en_name || '—'}</>
                      ) : col.key === 'sex' ? (
                        row.sex === 'm' ? 'Male' : row.sex === 'f' ? 'Female' : '—'
                      ) : (
                        row[col.key] || '—'
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="table-footer">
          Scroll to explore · Click column headers to sort
        </div>
      </section>
    </div>
    </div>
  );
}
