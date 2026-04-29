// screens.jsx — All app screens for the fishing prototype
// Depends on: data.js, ui.jsx, map.jsx

// ─── Stylized placeholder "photo" — striped panel with monospace caption ───
function PhotoPlaceholder({ label, h = 160, theme, tint }) {
  const bg = tint || theme.surfaceAlt;
  return (
    <div style={{
      height: h, borderRadius: 14, overflow: 'hidden', position: 'relative',
      background: bg,
      border: `1px solid ${theme.cardBorder}`,
    }}>
      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <pattern id="ph-stripes" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <rect width="6" height="6" fill="transparent"/>
            <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(0,0,0,.06)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#ph-stripes)"/>
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 10, color: theme.inkMuted, letterSpacing: '0.05em', textTransform: 'uppercase',
      }}>
        {label}
      </div>
    </div>
  );
}

// ─── MAP SCREEN ─────────────────────────────────────────────────────────────
function MapScreen({ t, theme, date, setDate, mapStyle, setMapStyle, lang, selectedId, setSelectedId, savedIds, onOpenDetail, platform }) {
  const [showStylePicker, setShowStylePicker] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const selectedWb = selectedId ? WATERBODIES.find(w => w.id === selectedId) : null;
  const selectedStatus = selectedWb ? getStatus(selectedWb, date) : null;

  const filtered = WATERBODIES.filter(wb => {
    const name = (lang === 'lt' ? wb.nameLt : wb.nameEn).toLowerCase();
    return name.includes(query.toLowerCase());
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: theme.bg, color: theme.ink, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: theme.inkSubtle, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
            {fmtFullDate(date, lang)}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2 }}>
            {lang === 'lt' ? 'Lietuvos vandenys' : 'Lithuanian waters'}
          </div>
        </div>
        <button onClick={() => setShowStylePicker(s => !s)} style={{
          appearance: 'none', border: `1px solid ${theme.cardBorder}`, background: theme.card,
          borderRadius: 999, padding: '6px 10px', color: theme.inkMuted, display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 12, fontWeight: 500, cursor: 'pointer',
        }}>{Ico.layers(theme.inkMuted)}</button>
      </div>

      {/* Search bar */}
      <div style={{ padding: '0 16px 10px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: theme.card, border: `1px solid ${theme.cardBorder}`,
          borderRadius: 12, padding: '9px 12px',
        }} onClick={() => setSearchOpen(true)}>
          {Ico.search(theme.inkSubtle)}
          <input
            placeholder={t.search}
            value={query}
            onChange={e => { setQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 14, color: theme.ink, fontFamily: 'inherit',
            }}
          />
          {query && (
            <button onClick={(e) => { e.stopPropagation(); setQuery(''); }} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}>
              {Ico.x(theme.inkSubtle)}
            </button>
          )}
        </div>
      </div>

      {/* Search results overlay */}
      {searchOpen && query && (
        <div style={{ padding: '0 16px 8px' }}>
          <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
            {filtered.slice(0, 5).map((wb, i) => {
              const st = getStatus(wb, date).status;
              const color = st === 'open' ? theme.success : st === 'closed' ? theme.danger : theme.warning;
              return (
                <div key={wb.id}
                  onClick={() => { setSelectedId(wb.id); setSearchOpen(false); setQuery(''); onOpenDetail(wb.id); }}
                  style={{
                    padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10,
                    borderBottom: i < Math.min(4, filtered.length - 1) ? `1px solid ${theme.divider}` : 'none',
                    cursor: 'pointer',
                  }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: color }}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{lang === 'lt' ? wb.nameLt : wb.nameEn}</div>
                    <div style={{ fontSize: 11, color: theme.inkSubtle }}>{lang === 'lt' ? wb.region.lt : wb.region.en}</div>
                  </div>
                  {Ico.chevron(theme.inkSubtle)}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ padding: 14, fontSize: 13, color: theme.inkSubtle, textAlign: 'center' }}>
                {lang === 'lt' ? 'Nieko nerasta' : 'No results'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map */}
      <div style={{ flex: 1, position: 'relative', margin: '0 12px', borderRadius: 16, overflow: 'hidden', border: `1px solid ${theme.cardBorder}`, background: theme.card, minHeight: 0 }}>
        <LithuaniaMap
          date={date}
          mapStyle={mapStyle}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id)}
          savedIds={savedIds}
          lang={lang}
          width="100%"
          height="100%"
        />

        {/* Map style picker */}
        {showStylePicker && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: theme.card, border: `1px solid ${theme.cardBorder}`,
            borderRadius: 12, padding: 6, boxShadow: theme.shadow, zIndex: 10,
          }}>
            {['minimal', 'topographic', 'satellite'].map(m => (
              <button key={m} onClick={() => { setMapStyle(m); setShowStylePicker(false); }} style={{
                display: 'block', width: '100%', textAlign: 'left',
                appearance: 'none', border: 'none', background: mapStyle === m ? theme.surfaceAlt : 'transparent',
                color: theme.ink, padding: '7px 12px', borderRadius: 8, fontSize: 12, fontFamily: 'inherit',
                textTransform: 'capitalize', cursor: 'pointer',
              }}>{m}</button>
            ))}
          </div>
        )}

        {/* Legend — horizontal */}
        <div style={{
          position: 'absolute', top: 10, left: 10, right: 10,
          display: 'flex', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            background: theme.card, border: `1px solid ${theme.cardBorder}`,
            borderRadius: 999, padding: '6px 12px', boxShadow: theme.shadow,
            fontSize: 10, display: 'flex', alignItems: 'center', gap: 12,
            pointerEvents: 'auto',
          }}>
            {[
              { c: theme.success, l: t.canFish },
              { c: theme.warning, l: t.partial },
              { c: theme.danger, l: t.cannotFish },
            ].map((x, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: x.c }}/>
                <span style={{ color: theme.inkMuted, whiteSpace: 'nowrap' }}>{x.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected water body preview card */}
      {selectedWb && (
        <div style={{ padding: '10px 12px 12px' }}>
          <div onClick={() => onOpenDetail(selectedWb.id)} style={{
            background: theme.card, border: `1px solid ${theme.cardBorder}`,
            borderRadius: 14, padding: 12, boxShadow: theme.shadow, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: theme.surfaceAlt,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {Ico.location(theme.accent)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>
                {lang === 'lt' ? selectedWb.nameLt : selectedWb.nameEn}
              </div>
              <div style={{ fontSize: 11, color: theme.inkSubtle, marginTop: 1 }}>
                {lang === 'lt' ? selectedWb.region.lt : selectedWb.region.en}
              </div>
              <div style={{ marginTop: 6 }}>
                <StatusChip status={selectedStatus.status} t={t} theme={theme} size="sm"/>
              </div>
            </div>
            {Ico.chevron(theme.inkSubtle)}
          </div>
        </div>
      )}

      {/* Bottom tab spacer handled by parent */}
    </div>
  );
}

// ─── WATER BODY DETAIL SCREEN ───────────────────────────────────────────────
function DetailScreen({ t, theme, lang, date, setDate, waterbody, savedIds, toggleSave, onBack, onOpenSpecies, ruleDetail, platform }) {
  const [tab, setTab] = React.useState('rules'); // 'rules' | 'calendar' | 'species' | 'weather'
  const status = getStatus(waterbody, date);
  const forecast = getForecast(waterbody.id, date);
  const isSaved = savedIds.includes(waterbody.id);

  const name = lang === 'lt' ? waterbody.nameLt : waterbody.nameEn;
  const region = lang === 'lt' ? waterbody.region.lt : waterbody.region.en;
  const note = waterbody.note ? (lang === 'lt' ? waterbody.note.lt : waterbody.note.en) : null;

  const headerTint = status.status === 'open' ? theme.successSoft
                   : status.status === 'closed' ? theme.dangerSoft
                   : theme.warningSoft;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: theme.bg, color: theme.ink, overflow: 'hidden' }}>
      {/* Header with back */}
      <div style={{
        padding: '10px 10px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button onClick={onBack} style={{
          appearance: 'none', border: 'none', background: 'transparent',
          width: 36, height: 36, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>{Ico.back(theme.ink)}</button>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => toggleSave(waterbody.id)} style={{
            appearance: 'none', border: 'none', background: isSaved ? theme.accent : 'transparent',
            color: isSaved ? theme.accentInk : theme.ink,
            width: 36, height: 36, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>{isSaved ? Ico.bookmarkFill('currentColor') : Ico.bookmark(theme.ink)}</button>
          <button style={{
            appearance: 'none', border: 'none', background: 'transparent',
            width: 36, height: 36, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>{Ico.share(theme.ink)}</button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Hero */}
        <div style={{ padding: '6px 20px 16px' }}>
          <div style={{ fontSize: 12, color: theme.inkSubtle, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {waterbody.type === 'lake' ? (lang === 'lt' ? 'Ežeras' : 'Lake')
             : waterbody.type === 'river' ? (lang === 'lt' ? 'Upė' : 'River')
             : waterbody.type === 'reservoir' ? (lang === 'lt' ? 'Marios' : 'Reservoir')
             : (lang === 'lt' ? 'Lagūna' : 'Lagoon')}
            {' · '}{region}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', marginTop: 4, textWrap: 'pretty' }}>
            {name}
          </div>
          <div style={{ marginTop: 12 }}>
            <StatusChip status={status.status} t={t} theme={theme} size="lg"/>
          </div>
        </div>

        {/* Hero status panel */}
        <div style={{ padding: '0 12px' }}>
          <div style={{
            background: headerTint, borderRadius: 16, padding: '16px 16px 14px',
            border: `1px solid ${theme.cardBorder}`,
          }}>
            <div style={{ fontSize: 12, color: theme.inkMuted, fontWeight: 600 }}>
              {t.today} · {fmtDate(date, lang)}
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em', marginTop: 6, textWrap: 'pretty' }}>
              {status.status === 'open' && (lang === 'lt'
                ? `Šiandien galite žvejoti ${status.openSpecies.length} rūšis.`
                : `${status.openSpecies.length} species open for fishing today.`)}
              {status.status === 'partial' && (lang === 'lt'
                ? `${status.openSpecies.length} rūšys leidžiamos, ${status.closedSpecies.length} – draudžiamos.`
                : `${status.openSpecies.length} species allowed, ${status.closedSpecies.length} restricted.`)}
              {status.status === 'closed' && (lang === 'lt'
                ? `Visos rūšys šiuo metu saugomos.`
                : `All species currently protected.`)}
            </div>
            {(status.reasonLt || status.reasonEn) && ruleDetail !== 'simple' && (
              <div style={{ fontSize: 13, color: theme.inkMuted, marginTop: 6 }}>
                {t.reason}: {lang === 'lt' ? status.reasonLt : status.reasonEn}
              </div>
            )}
            {note && (
              <div style={{
                marginTop: 10, padding: '8px 10px', background: 'rgba(255,255,255,.55)', borderRadius: 8,
                fontSize: 12, color: theme.inkMuted,
              }}>
                ⚑ {note}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 4, padding: '14px 12px 0',
          position: 'sticky', top: 0, background: theme.bg, zIndex: 5,
        }}>
          {[
            { id: 'rules', label: t.rules },
            { id: 'calendar', label: t.calendar },
            { id: 'species', label: t.species },
            { id: 'weather', label: t.weather },
          ].map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{
              appearance: 'none', border: 'none',
              flex: 1,
              background: tab === tb.id ? theme.ink : 'transparent',
              color: tab === tb.id ? theme.card : theme.inkMuted,
              padding: '8px 10px', borderRadius: 999,
              fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
              letterSpacing: '-0.01em',
            }}>{tb.label}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: '14px 12px 20px' }}>
          {tab === 'rules' && <RulesTab waterbody={waterbody} status={status} date={date} t={t} theme={theme} lang={lang} ruleDetail={ruleDetail} onOpenSpecies={onOpenSpecies}/>}
          {tab === 'calendar' && <CalendarTab waterbody={waterbody} date={date} t={t} theme={theme} lang={lang} setDate={setDate}/>}
          {tab === 'species' && <SpeciesTab waterbody={waterbody} date={date} t={t} theme={theme} lang={lang} onOpenSpecies={onOpenSpecies}/>}
          {tab === 'weather' && <WeatherTab forecast={forecast} t={t} theme={theme} lang={lang}/>}
        </div>
      </div>
    </div>
  );
}

function RulesTab({ waterbody, status, date, t, theme, lang, ruleDetail, onOpenSpecies }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Per-species rules */}
      {waterbody.species.map(id => {
        const sp = SPECIES.find(s => s.id === id);
        const open = getSpeciesStatus(sp, date) === 'open';
        return (
          <div key={id} onClick={() => onOpenSpecies(id)} style={{
            background: theme.card, border: `1px solid ${theme.cardBorder}`,
            borderRadius: 12, padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
          }}>
            <div style={{ width: 44, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FishIcon species={sp} size={22} theme={theme}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {lang === 'lt' ? sp.nameLt : sp.nameEn}
              </div>
              {ruleDetail === 'detailed' && (
                <div style={{ fontSize: 11, color: theme.inkSubtle, marginTop: 2 }}>
                  {t.minSize}: {sp.minSize > 0 ? `${sp.minSize} cm` : '—'} · {t.bagLimit}: {sp.bagLimit ?? t.noLimit}
                </div>
              )}
              {ruleDetail === 'simple' && sp.closedSeason && !open && (
                <div style={{ fontSize: 11, color: theme.danger, marginTop: 2 }}>
                  {t.closedSeason}
                </div>
              )}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 8px', borderRadius: 999,
              background: open ? theme.successSoft : theme.dangerSoft,
              color: open ? theme.success : theme.danger,
              fontSize: 11, fontWeight: 600,
            }}>
              {open ? Ico.check('currentColor') : Ico.x('currentColor')}
              {open ? t.yes : t.no}
            </div>
          </div>
        );
      })}

      {/* General rules card */}
      {ruleDetail === 'detailed' && (
        <div style={{
          marginTop: 8,
          background: theme.card, border: `1px solid ${theme.cardBorder}`,
          borderRadius: 12, padding: '12px 14px',
        }}>
          <div style={{ fontSize: 11, color: theme.inkSubtle, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 8 }}>
            {lang === 'lt' ? 'Bendrosios taisyklės' : 'General rules'}
          </div>
          {[
            lang === 'lt' ? 'Privaloma turėti galiojančią žvejo kortelę' : 'Valid angler licence required',
            lang === 'lt' ? 'Maksimaliai 2 meškerės vienam žvejui' : 'Max 2 rods per angler',
            lang === 'lt' ? 'Draudžiama žvejoti 100 m nuo nerštaviečių' : 'No fishing within 100 m of spawning grounds',
            lang === 'lt' ? 'Visi sugauti mažesni nei leistinas dydis paleidžiami' : 'Undersized fish must be released',
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', fontSize: 13, color: theme.inkMuted }}>
              <span style={{ color: theme.accent, flexShrink: 0 }}>·</span>
              <span>{r}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CalendarTab({ waterbody, date, t, theme, lang, setDate }) {
  const [viewMonth, setViewMonth] = React.useState(new Date(date.getFullYear(), date.getMonth(), 1));
  const cells = monthDays(viewMonth.getFullYear(), viewMonth.getMonth());
  const monthName = fmtFullDate(viewMonth, lang).replace(/\s+\d+\s+d\.$|,\s+\d+$/, '').replace(/^\d+\s+/, (lang === 'lt' ? '' : ''));

  const dayHeaders = lang === 'lt' ? ['P','A','T','K','Pn','Š','S'] : ['M','T','W','T','F','S','S'];

  const go = (delta) => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1));

  const title = lang === 'lt'
    ? ['sausis','vasaris','kovas','balandis','gegužė','birželis','liepa','rugpjūtis','rugsėjis','spalis','lapkritis','gruodis'][viewMonth.getMonth()] + ' ' + viewMonth.getFullYear()
    : ['January','February','March','April','May','June','July','August','September','October','November','December'][viewMonth.getMonth()] + ' ' + viewMonth.getFullYear();

  return (
    <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 14, padding: 14 }}>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <button onClick={() => go(-1)} style={{ appearance: 'none', border: 'none', background: 'transparent', padding: 6, cursor: 'pointer', transform: 'rotate(180deg)' }}>{Ico.chevron(theme.inkMuted)}</button>
        <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>{title}</div>
        <button onClick={() => go(1)} style={{ appearance: 'none', border: 'none', background: 'transparent', padding: 6, cursor: 'pointer' }}>{Ico.chevron(theme.inkMuted)}</button>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {dayHeaders.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10, color: theme.inkSubtle, fontWeight: 600, padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} style={{ aspectRatio: '1' }}/>;
          const st = getStatus(waterbody, d).status;
          const bg = st === 'open' ? theme.successSoft : st === 'closed' ? theme.dangerSoft : theme.warningSoft;
          const fg = st === 'open' ? theme.success : st === 'closed' ? theme.danger : theme.warning;
          const isSelected = d.toDateString() === date.toDateString();
          return (
            <button key={i} onClick={() => setDate(new Date(d))} style={{
              appearance: 'none', border: isSelected ? `2px solid ${theme.ink}` : '1px solid transparent',
              background: bg, color: fg,
              aspectRatio: '1', borderRadius: 8,
              fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
              cursor: 'pointer', padding: 0,
            }}>{d.getDate()}</button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: 10, color: theme.inkMuted }}>
        {[{c: theme.success, l: t.canFish}, {c: theme.warning, l: t.partial}, {c: theme.danger, l: t.cannotFish}].map((x, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 7, height: 7, borderRadius: 2, background: x.c }}/>
            <span>{x.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpeciesTab({ waterbody, date, t, theme, lang, onOpenSpecies }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {waterbody.species.map(id => {
        const sp = SPECIES.find(s => s.id === id);
        const open = getSpeciesStatus(sp, date) === 'open';
        return (
          <div key={id} onClick={() => onOpenSpecies(id)} style={{
            background: theme.card, border: `1px solid ${theme.cardBorder}`,
            borderRadius: 12, padding: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 72, height: 44, borderRadius: 8,
              background: theme.surfaceAlt, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <FishIcon species={sp} size={30} theme={theme}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{lang === 'lt' ? sp.nameLt : sp.nameEn}</div>
                <div style={{ fontSize: 10, color: theme.inkSubtle, fontStyle: 'italic' }}>{sp.latin}</div>
              </div>
              <div style={{ fontSize: 11, color: theme.inkSubtle, marginTop: 2 }}>
                {t.minSize}: {sp.minSize > 0 ? `${sp.minSize} cm` : '—'} · {t.bagLimit}: {sp.bagLimit ?? t.noLimit}
              </div>
            </div>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: open ? theme.success : theme.danger }}/>
          </div>
        );
      })}
    </div>
  );
}

function WeatherTab({ forecast, t, theme, lang }) {
  const labels = {
    excellent: t.excellent, good: t.good, fair: t.fair, poor: t.poor,
  };
  const biteColor = [theme.danger, theme.warning, theme.success, theme.success][forecast.biteScore];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Bite index hero */}
      <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 14, padding: 16 }}>
        <div style={{ fontSize: 11, color: theme.inkSubtle, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.biteIndex}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: biteColor, letterSpacing: '-0.02em' }}>
            {labels[forecast.biteLabel]}
          </div>
        </div>
        {/* dots visualization */}
        <div style={{ display: 'flex', gap: 5, marginTop: 10 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              flex: 1, height: 6, borderRadius: 3,
              background: i <= forecast.biteScore ? biteColor : theme.surfaceAlt,
            }}/>
          ))}
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { icon: Ico.thermo, label: t.waterTemp, value: `${forecast.waterTemp}°C` },
          { icon: Ico.wind, label: t.wind, value: `${forecast.wind} m/s` },
          { icon: Ico.calendar, label: t.pressure, value: `${forecast.pressure} hPa` },
          { icon: () => <span style={{ fontSize: 16 }}>{forecast.moon}</span>, label: t.moonPhase, value: '—' },
        ].map((m, i) => (
          <div key={i} style={{
            background: theme.card, border: `1px solid ${theme.cardBorder}`,
            borderRadius: 12, padding: '12px 12px',
          }}>
            <div style={{ color: theme.inkSubtle, display: 'flex', alignItems: 'center', gap: 6 }}>
              {m.icon(theme.inkMuted)}
              <span style={{ fontSize: 11, fontWeight: 500 }}>{m.label}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4, letterSpacing: '-0.01em' }}>{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SPECIES DETAIL SCREEN ──────────────────────────────────────────────────
function SpeciesScreen({ t, theme, lang, date, species, onBack }) {
  const open = getSpeciesStatus(species, date) === 'open';
  const name = lang === 'lt' ? species.nameLt : species.nameEn;
  const desc = lang === 'lt' ? species.desc.lt : species.desc.en;
  const habitat = lang === 'lt' ? species.habitat.lt : species.habitat.en;
  const bait = lang === 'lt' ? species.bestBait.lt : species.bestBait.en;
  const bestTime = lang === 'lt' ? species.bestTime.lt : species.bestTime.en;

  // Build a year-long calendar strip showing open/closed by month
  const monthStatus = Array.from({ length: 12 }, (_, i) => {
    // Test the 15th of each month
    const d = new Date(date.getFullYear(), i, 15);
    return getSpeciesStatus(species, d);
  });
  const monthLabels = lang === 'lt'
    ? ['S','V','K','B','G','B','L','R','R','S','L','G']
    : ['J','F','M','A','M','J','J','A','S','O','N','D'];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: theme.bg, color: theme.ink, overflow: 'hidden' }}>
      <div style={{ padding: '10px 10px 0' }}>
        <button onClick={onBack} style={{
          appearance: 'none', border: 'none', background: 'transparent',
          width: 36, height: 36, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>{Ico.back(theme.ink)}</button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '4px 16px 20px' }}>
        {/* Hero */}
        <div style={{
          background: species.color + '22',
          borderRadius: 16, padding: '20px 16px', textAlign: 'center', border: `1px solid ${theme.cardBorder}`,
          marginBottom: 16,
        }}>
          <FishIcon species={species} size={60} theme={theme}/>
          <div style={{ fontSize: 10, color: theme.inkSubtle, marginTop: 14, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {lang === 'lt' ? 'Rūšies iliustracija' : 'Species illustration'}
          </div>
        </div>

        {/* Title */}
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>{name}</div>
        <div style={{ fontSize: 13, color: theme.inkSubtle, fontStyle: 'italic', marginTop: 2 }}>{species.latin}</div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <StatusChip status={open ? 'open' : 'closed'} t={t} theme={theme}/>
          {species.licenceRequired && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 999,
              background: theme.warningSoft, color: theme.warning,
              fontSize: 12, fontWeight: 600,
            }}>
              {lang === 'lt' ? 'Speciali licencija' : 'Special licence'}
            </span>
          )}
        </div>

        {/* Description */}
        <div style={{ fontSize: 14, color: theme.inkMuted, marginTop: 14, lineHeight: 1.55, textWrap: 'pretty' }}>{desc}</div>

        {/* Rule stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
          <StatBlock theme={theme} label={t.minSize} value={species.minSize > 0 ? `${species.minSize} cm` : '—'} icon={Ico.ruler}/>
          <StatBlock theme={theme} label={t.bagLimit} value={species.bagLimit ?? t.noLimit} icon={Ico.weight}/>
        </div>

        {/* Yearly availability */}
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 11, color: theme.inkSubtle, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 8 }}>
            {lang === 'lt' ? 'Sezonai' : 'Seasons'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
            {monthStatus.map((s, i) => (
              <div key={i} style={{
                aspectRatio: '1',
                background: s === 'open' ? theme.successSoft : theme.dangerSoft,
                color: s === 'open' ? theme.success : theme.danger,
                borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700,
              }}>{monthLabels[i]}</div>
            ))}
          </div>
          {species.closedSeason && (
            <div style={{ fontSize: 12, color: theme.inkMuted, marginTop: 8 }}>
              {t.closedSeason}: {['', 'sausis','vasaris','kovas','balandis','gegužė','birželis','liepa','rugpjūtis','rugsėjis','spalis','lapkritis','gruodis'][species.closedSeason[0][0]]} {species.closedSeason[0][1]} – {['', 'sausis','vasaris','kovas','balandis','gegužė','birželis','liepa','rugpjūtis','rugsėjis','spalis','lapkritis','gruodis'][species.closedSeason[1][0]]} {species.closedSeason[1][1]}
            </div>
          )}
        </div>

        {/* Habitat / bait / time */}
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <InfoRow theme={theme} label={t.habitat} value={habitat}/>
          <InfoRow theme={theme} label={t.bestBait} value={bait}/>
          <InfoRow theme={theme} label={t.bestTime} value={bestTime}/>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ theme, label, value, icon }) {
  return (
    <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, padding: 12 }}>
      <div style={{ color: theme.inkSubtle, display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon(theme.inkMuted)}
        <span style={{ fontSize: 11, fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4, letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  );
}

function InfoRow({ theme, label, value }) {
  return (
    <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ fontSize: 11, color: theme.inkSubtle, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: 14, marginTop: 3 }}>{value}</div>
    </div>
  );
}

// ─── SAVED SCREEN ───────────────────────────────────────────────────────────
function SavedScreen({ t, theme, lang, date, savedIds, onOpenDetail }) {
  const spots = WATERBODIES.filter(w => savedIds.includes(w.id));
  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.ink, overflow: 'auto' }}>
      <div style={{ padding: '14px 16px 8px' }}>
        <div style={{ fontSize: 11, color: theme.inkSubtle, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {spots.length} {lang === 'lt' ? 'vietos' : 'places'}
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2 }}>
          {t.savedSpots}
        </div>
      </div>
      <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {spots.map(wb => {
          const st = getStatus(wb, date).status;
          const color = st === 'open' ? theme.success : st === 'closed' ? theme.danger : theme.warning;
          const bg = st === 'open' ? theme.successSoft : st === 'closed' ? theme.dangerSoft : theme.warningSoft;
          return (
            <div key={wb.id} onClick={() => onOpenDetail(wb.id)} style={{
              background: theme.card, border: `1px solid ${theme.cardBorder}`,
              borderRadius: 14, padding: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'stretch', gap: 12,
            }}>
              <div style={{
                width: 70, borderRadius: 10, background: bg,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <div style={{ fontSize: 20, fontWeight: 700, color }}>{wb.species.length}</div>
                <div style={{ fontSize: 9, color: theme.inkMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {lang === 'lt' ? 'rūšys' : 'species'}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{lang === 'lt' ? wb.nameLt : wb.nameEn}</div>
                <div style={{ fontSize: 11, color: theme.inkSubtle, marginTop: 1 }}>{lang === 'lt' ? wb.region.lt : wb.region.en}</div>
                <div style={{ marginTop: 6 }}>
                  <StatusChip status={st} t={t} theme={theme} size="sm"/>
                </div>
              </div>
            </div>
          );
        })}
        {spots.length === 0 && (
          <div style={{
            padding: 32, textAlign: 'center', color: theme.inkSubtle, fontSize: 13,
            background: theme.card, border: `1px dashed ${theme.cardBorder}`, borderRadius: 14,
          }}>
            {lang === 'lt' ? 'Dar nėra išsaugotų vietų.' : 'No saved spots yet.'}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LOG SCREEN ─────────────────────────────────────────────────────────────
function LogScreen({ t, theme, lang, date }) {
  const totalFish = MY_CATCHES.length;
  const bySpecies = {};
  MY_CATCHES.forEach(c => { bySpecies[c.speciesId] = (bySpecies[c.speciesId] || 0) + 1; });
  const top = Object.entries(bySpecies).sort((a,b) => b[1]-a[1])[0];
  const topSp = top ? SPECIES.find(s => s.id === top[0]) : null;

  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.ink, overflow: 'auto' }}>
      <div style={{ padding: '14px 16px 8px' }}>
        <div style={{ fontSize: 11, color: theme.inkSubtle, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {t.thisMonth}
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2 }}>
          {t.myCatches}
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ padding: '8px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <StatCard theme={theme} value={totalFish} label={lang === 'lt' ? 'Sugauti' : 'Catches'}/>
        <StatCard theme={theme} value={Object.keys(bySpecies).length} label={lang === 'lt' ? 'Rūšys' : 'Species'}/>
        <StatCard theme={theme} value={topSp ? (lang === 'lt' ? topSp.nameLt : topSp.nameEn) : '—'} label={lang === 'lt' ? 'Dažniausia' : 'Most frequent'} small/>
      </div>

      {/* Catches list */}
      <div style={{ padding: '8px 12px 100px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MY_CATCHES.map(c => {
          const sp = SPECIES.find(s => s.id === c.speciesId);
          const wb = WATERBODIES.find(w => w.id === c.waterbodyId);
          return (
            <div key={c.id} style={{
              background: theme.card, border: `1px solid ${theme.cardBorder}`,
              borderRadius: 14, padding: 12,
              display: 'flex', gap: 12,
            }}>
              <div style={{ width: 64, flexShrink: 0 }}>
                <PhotoPlaceholder label={lang === 'lt' ? 'Nuotr.' : 'Photo'} h={64} theme={theme} tint={sp.color + '22'}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{lang === 'lt' ? sp.nameLt : sp.nameEn}</div>
                  <div style={{ fontSize: 11, color: theme.inkSubtle }}>{c.date}</div>
                </div>
                <div style={{ fontSize: 12, color: theme.inkMuted, marginTop: 2 }}>
                  {lang === 'lt' ? wb.nameLt : wb.nameEn}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  <Metric theme={theme} label={t.size} value={`${c.size} cm`}/>
                  <Metric theme={theme} label={t.weight} value={`${c.weight} kg`}/>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ theme, value, label, small }) {
  return (
    <div style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, padding: '10px 12px' }}>
      <div style={{
        fontSize: small ? 14 : 22, fontWeight: 700, letterSpacing: '-0.02em',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{value}</div>
      <div style={{ fontSize: 10, color: theme.inkSubtle, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Metric({ theme, label, value }) {
  return (
    <div>
      <span style={{ fontSize: 11, color: theme.inkSubtle, marginRight: 4 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

// ─── MORE SCREEN (licence, settings) ───────────────────────────────────────
function MoreScreen({ t, theme, lang }) {
  const validUntil = '2026-12-31';
  return (
    <div style={{ height: '100%', background: theme.bg, color: theme.ink, overflow: 'auto' }}>
      <div style={{ padding: '14px 16px 8px' }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>{t.tabs.more}</div>
      </div>

      {/* Licence card */}
      <div style={{ padding: '8px 12px' }}>
        <div style={{
          background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accent}dd 100%)`,
          color: theme.accentInk,
          borderRadius: 16, padding: 16,
          boxShadow: theme.shadow,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {t.licence}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6, letterSpacing: '-0.02em' }}>
                {lang === 'lt' ? 'Mėgėjų žvejybos kortelė' : 'Angler licence'}
              </div>
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(255,255,255,.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2 L20 6 V12 C20 17, 16 21, 12 22 C8 21, 4 17, 4 12 V6 Z"/><path d="M9 12l2 2 4-4"/></svg>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 20 }}>
            <div>
              <div style={{ fontSize: 10, opacity: 0.75 }}>{t.validUntil}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{validUntil}</div>
            </div>
            <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, opacity: 0.85 }}>
              LT · 47 ••• 3201
            </div>
          </div>
        </div>
      </div>

      {/* Actions list */}
      <div style={{ padding: '12px 12px' }}>
        <div style={{
          background: theme.card, border: `1px solid ${theme.cardBorder}`,
          borderRadius: 14, overflow: 'hidden',
        }}>
          {[
            { label: t.buyLicence, icon: Ico.plus },
            { label: lang === 'lt' ? 'Pranešti apie pažeidimą' : 'Report a violation', icon: Ico.share },
            { label: lang === 'lt' ? 'Pagalba ir DUK' : 'Help & FAQ', icon: Ico.book },
            { label: lang === 'lt' ? 'Apie taisykles' : 'About rules', icon: Ico.book },
          ].map((row, i, arr) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', cursor: 'pointer',
              borderBottom: i < arr.length - 1 ? `1px solid ${theme.divider}` : 'none',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: theme.surfaceAlt,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>{row.icon(theme.inkMuted)}</div>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{row.label}</div>
              {Ico.chevron(theme.inkSubtle)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TAB BAR ────────────────────────────────────────────────────────────────
function TabBar({ t, theme, active, setActive, platform }) {
  const tabs = [
    { id: 'map', label: t.tabs.map, icon: Ico.map },
    { id: 'saved', label: t.tabs.saved, icon: Ico.bookmark },
    { id: 'log', label: t.tabs.log, icon: Ico.book },
    { id: 'more', label: t.tabs.more, icon: Ico.more },
  ];
  const isAndroid = platform === 'android';
  return (
    <div style={{
      borderTop: `1px solid ${theme.divider}`,
      background: theme.surface,
      padding: isAndroid ? '4px 4px 2px' : '6px 4px 4px',
      display: 'flex', justifyContent: 'space-around',
    }}>
      {tabs.map(tb => {
        const on = active === tb.id;
        return (
          <button key={tb.id} onClick={() => setActive(tb.id)} style={{
            appearance: 'none', border: 'none', background: 'transparent',
            flex: 1, padding: isAndroid ? '4px 0 2px' : '6px 0 0',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            color: on ? theme.accent : theme.inkSubtle, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {isAndroid ? (
              <div style={{
                padding: '4px 16px', borderRadius: 999,
                background: on ? theme.successSoft : 'transparent',
              }}>{tb.icon('currentColor')}</div>
            ) : tb.icon('currentColor')}
            <span style={{ fontSize: 10, fontWeight: on ? 600 : 500, letterSpacing: '-0.01em' }}>{tb.label}</span>
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, {
  MapScreen, DetailScreen, SpeciesScreen, SavedScreen, LogScreen, MoreScreen, TabBar, PhotoPlaceholder,
});
