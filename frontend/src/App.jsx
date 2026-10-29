import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const MAX_SEARCH_DAYS = 14

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const validationMessage = body.errors
      ? Object.values(body.errors).flat().join(' ')
      : body.message
    throw new Error(validationMessage || 'Une erreur est survenue. Veuillez réessayer.')
  }

  return body
}

function dateValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(value, days) {
  const date = new Date(`${value}T12:00:00`)
  date.setDate(date.getDate() + days)
  return dateValue(date)
}

function localDateTimeToIso(date, time) {
  return new Date(`${date}T${time}:00`).toISOString()
}

function formatSlot(slot) {
  const start = new Date(slot.starts_at)
  const end = new Date(slot.ends_at)
  const day = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(start)
  const time = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return { day: day.replace('.', ''), time: `${time.format(start)} – ${time.format(end)}` }
}

function formatFullDate(value) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function initials(firstName = '', lastName = '') {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function Icon({ name, size = 18, className = '' }) {
  const paths = {
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" /><path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20M8 7h8M8 10h6" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2z" /><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9z" /></>,
    school: <><path d="m3 9 9-5 9 5-9 5z" /><path d="M7 11v5c3 2.5 7 2.5 10 0v-5M21 9v6" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    star: <><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" /><path d="m9 12 2 2 4-4" /></>,
    sparkleCheck: <><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" /><path d="m16 17 1 1 3-3" /><path d="M19 12a7 7 0 1 1-7-7" /></>,
    chevron: <path d="m6 9 6 6 6-6" />,
    refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.6 9a7 7 0 0 1 11.7-2L20 12M4 12l2.7 5a7 7 0 0 0 11.7-2" /></>,
  }

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
      width={size}
    >
      {paths[name] || paths.spark}
    </svg>
  )
}

function TutorAvatar({ tutor, large = false }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className={`tutor-avatar${large ? ' tutor-avatar-large' : ''}`}>
      {tutor.photo_url && !failed ? (
        <img
          alt={`${tutor.first_name} ${tutor.last_name}`}
          onError={() => setFailed(true)}
          src={tutor.photo_url}
        />
      ) : (
        <span>{initials(tutor.first_name, tutor.last_name)}</span>
      )}
      <i aria-label="Tuteur actif" className="avatar-status" />
    </div>
  )
}

function App() {
  const today = useMemo(() => dateValue(new Date()), [])
  const [catalog, setCatalog] = useState({ subjects: [], school_levels: [] })
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [levelId, setLevelId] = useState('')
  const [fromDate, setFromDate] = useState(addDays(today, 1))
  const [toDate, setToDate] = useState(addDays(today, 12))
  const [timeWindows, setTimeWindows] = useState([{ start: '08:00', end: '20:00' }])
  const [matches, setMatches] = useState(null)
  const [searchCriteria, setSearchCriteria] = useState(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [sort, setSort] = useState('score')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [booking, setBooking] = useState(null)
  const [bookingForm, setBookingForm] = useState({
    parent_name: '',
    parent_email: '',
    student_name: '',
    notes: '',
  })
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')

  const fetchCatalog = useCallback(async () => apiRequest('/catalog'), [])

  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true)
    setCatalogError('')
    try {
      const data = await fetchCatalog()
      setCatalog(data)
      setSubjectId((current) => current || data.subjects.find((item) => item.name === 'Mathématiques')?.id || data.subjects[0]?.id || '')
      setLevelId((current) => current || data.school_levels.find((item) => item.name === '3e')?.id || data.school_levels[0]?.id || '')
    } catch (error) {
      setCatalogError(error.message)
    } finally {
      setCatalogLoading(false)
    }
  }, [fetchCatalog])

  useEffect(() => {
    let cancelled = false

    fetchCatalog()
      .then((data) => {
        if (cancelled) return
        setCatalog(data)
        setSubjectId(data.subjects.find((item) => item.name === 'Mathématiques')?.id || data.subjects[0]?.id || '')
        setLevelId(data.school_levels.find((item) => item.name === '3e')?.id || data.school_levels[0]?.id || '')
      })
      .catch((error) => {
        if (!cancelled) setCatalogError(error.message)
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false)
      })

    return () => { cancelled = true }
  }, [fetchCatalog])

  const selectedSubject = catalog.subjects.find((subject) => String(subject.id) === String(subjectId))
  const selectedLevel = catalog.school_levels.find((level) => String(level.id) === String(levelId))
  const selectedDays = fromDate && toDate
    ? Math.round((new Date(`${toDate}T12:00:00`) - new Date(`${fromDate}T12:00:00`)) / 86_400_000) + 1
    : 0
  const subjectLabel = searchCriteria?.subjectName || selectedSubject?.name || ''
  const gradeLabel = searchCriteria?.schoolLevelName || selectedLevel?.name || '—'

  function clearSearchResults() {
    setMatches(null)
    setSearchCriteria(null)
    setSearchError('')
  }

  const sortedMatches = useMemo(() => {
    if (!matches) return []
    const tutors = [...matches]
    if (sort === 'experience') tutors.sort((a, b) => b.experience_years - a.experience_years)
    if (sort === 'rating') tutors.sort((a, b) => b.rating - a.rating)
    if (sort === 'score') tutors.sort((a, b) => b.matching_score - a.matching_score)
    return tutors
  }, [matches, sort])

  function updateTimeWindow(index, field, value) {
    clearSearchResults()
    setTimeWindows((current) => current.map((window, windowIndex) => (
      windowIndex === index ? { ...window, [field]: value } : window
    )))
  }

  async function searchTutors(event) {
    event.preventDefault()
    setSearchError('')
    if (!subjectId || !levelId) {
      setSearchError('Choisissez une matière et un niveau scolaire pour lancer la recherche.')
      return
    }
    if (!fromDate || !toDate || toDate < fromDate) {
      setSearchError('La date de fin doit être égale ou postérieure à la date de début.')
      return
    }
    if (selectedDays > MAX_SEARCH_DAYS + 1) {
      setSearchError(`Choisissez une période de ${MAX_SEARCH_DAYS + 1} jours maximum.`)
      return
    }
    if (timeWindows.some((window) => !window.start || !window.end || window.end <= window.start)) {
      setSearchError('Chaque horaire doit se terminer après son heure de début.')
      return
    }

    const availability = []
    for (let offset = 0; offset < selectedDays; offset += 1) {
      const date = addDays(fromDate, offset)
      timeWindows.forEach((window) => {
        availability.push({
          start_at: localDateTimeToIso(date, window.start),
          end_at: localDateTimeToIso(date, window.end),
        })
      })
    }

    setSearching(true)
    clearSearchResults()
    try {
      const result = await apiRequest('/matches', {
        method: 'POST',
        body: JSON.stringify({
          subject_id: Number(subjectId),
          school_level_id: Number(levelId),
          availability,
        }),
      })
      setSearchCriteria({
        subjectId: result.criteria.subject.id,
        subjectName: result.criteria.subject.name,
        schoolLevelId: result.criteria.school_level.id,
        schoolLevelName: result.criteria.school_level.name,
        searchedDays: selectedDays,
        timeWindowsCount: timeWindows.length,
      })
      setMatches(result.tutors || [])
    } catch (error) {
      setSearchError(error.message)
    } finally {
      setSearching(false)
    }
  }

  function openBooking(tutor, slot) {
    if (!searchCriteria) return
    setSelectedSlot({ tutor, slot, criteria: searchCriteria })
    setBooking(null)
    setBookingError('')
    setBookingForm({ parent_name: '', parent_email: '', student_name: '', notes: '' })
  }

  function closeBooking() {
    if (bookingLoading) return
    setSelectedSlot(null)
    setBooking(null)
    setBookingError('')
  }

  async function submitBooking(event) {
    event.preventDefault()
    if (!selectedSlot) return
    setBookingLoading(true)
    setBookingError('')
    try {
      const result = await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          tutor_id: selectedSlot.tutor.id,
          availability_id: selectedSlot.slot.id,
          subject_id: selectedSlot.criteria.subjectId,
          school_level_id: selectedSlot.criteria.schoolLevelId,
          ...bookingForm,
        }),
      })
      setBooking(result.data)
      setMatches((current) => current?.map((tutor) => ({
        ...tutor,
        available_slots: tutor.available_slots.filter((slot) => slot.id !== selectedSlot.slot.id),
      })).filter((tutor) => tutor.available_slots.length > 0) || current)
    } catch (error) {
      setBookingError(error.message)
    } finally {
      setBookingLoading(false)
    }
  }

  function updateBookingForm(event) {
    setBookingForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a aria-label="Tutora, accueil" className="brand" href="#top">
            <span className="brand-mark"><Icon name="book" size={21} /></span>
            <span>Tutora<span className="brand-period">.</span></span>
          </a>
          <nav aria-label="Navigation principale" className="top-nav">
            <a className="nav-link nav-link-active" href="#recherche">Trouver un tuteur</a>
            <a className="nav-link" href="#fonctionnement">Comment ça marche</a>
          </nav>
          <div className="topbar-status"><span className="status-dot" /> Réservation instantanée</div>
        </div>
      </header>

      <main id="top">
        <section className="hero-wrap">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-spark"><Icon name="spark" size={15} /></span> Le bon accompagnement commence ici</div>
            <h1>Le bon tuteur,<br /><span>au bon moment.</span></h1>
            <p>Des cours particuliers en ligne choisis selon la matière, le niveau et les disponibilités de votre enfant.</p>
            <div className="hero-proof">
              <span><Icon name="shield" size={16} /> Profils sélectionnés selon vos critères</span>
              <span className="proof-divider" />
              <span><Icon name="check" size={16} /> Réservation sans attente</span>
            </div>
          </div>
          <div aria-hidden="true" className="hero-art">
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <div className="art-card art-note"><span className="art-note-icon"><Icon name="school" size={18} /></span><span><b>Un cours à son rythme</b><small>Un créneau qui vous convient</small></span></div>
            <div className="art-center"><Icon name="book" size={42} /></div>
            <div className="art-card art-match"><span className="match-mini-icon"><Icon name="spark" size={18} /></span><span><b>Recherche personnalisée</b><small>Selon ses besoins réels</small></span></div>
            <span className="art-star star-one">✳</span><span className="art-star star-two">✦</span>
          </div>
        </section>

        <section className="search-section" id="recherche">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Votre recherche</span>
              <h2>De quoi votre enfant a-t-il besoin ?</h2>
            </div>
            <span className="step-count"><span>01</span> / 02</span>
          </div>

          {catalogError ? (
            <div className="notice notice-error" role="alert">
              <div><b>Le catalogue n’est pas accessible.</b><p>{catalogError} Vérifiez que l’API Laravel fonctionne.</p></div>
              <button className="button button-secondary" onClick={loadCatalog} type="button"><Icon name="refresh" /> Réessayer</button>
            </div>
          ) : (
            <form className="search-panel" onSubmit={searchTutors}>
              <div className="form-grid form-grid-main">
                <label className="field">
                  <span className="field-label"><Icon name="school" size={17} /> Niveau scolaire</span>
                  <span className="select-wrap">
                    <select disabled={catalogLoading} onChange={(event) => { clearSearchResults(); setLevelId(event.target.value) }} required value={levelId}>
                      <option value="">Choisir un niveau</option>
                      {catalog.school_levels.map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}
                    </select>
                    <Icon className="select-chevron" name="chevron" size={16} />
                  </span>
                </label>
                <label className="field">
                  <span className="field-label"><Icon name="book" size={17} /> Matière à travailler</span>
                  <span className="select-wrap">
                    <select disabled={catalogLoading} onChange={(event) => { clearSearchResults(); setSubjectId(event.target.value) }} required value={subjectId}>
                      <option value="">Choisir une matière</option>
                      {catalog.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                    </select>
                    <Icon className="select-chevron" name="chevron" size={16} />
                  </span>
                </label>
              </div>

              <div className="field-divider" />

              <div className="availability-heading">
                <div>
                  <span className="field-label"><Icon name="calendar" size={17} /> Quand êtes-vous disponibles ?</span>
                  <p>Choisissez une période et les horaires qui vous arrangent. Nous chercherons les cours qui y tiennent.</p>
                </div>
                <span className="availability-note"><Icon name="clock" size={15} /> Fuseau horaire local</span>
              </div>

              <div className="form-grid form-grid-dates">
                <label className="field">
                  <span className="field-label field-label-muted">À partir du</span>
                  <input max={toDate || undefined} min={today} onChange={(event) => { clearSearchResults(); setFromDate(event.target.value) }} required type="date" value={fromDate} />
                </label>
                <label className="field">
                  <span className="field-label field-label-muted">Jusqu’au</span>
                  <input min={fromDate || today} onChange={(event) => { clearSearchResults(); setToDate(event.target.value) }} required type="date" value={toDate} />
                </label>
                <div className="duration-hint"><span className="duration-icon"><Icon name="calendar" size={17} /></span><span><b>{selectedDays > 0 ? `${selectedDays} jours` : 'Période à choisir'}</b><small>Jusqu’à 15 jours de recherche</small></span></div>
              </div>

              <div className="time-windows-list">
                {timeWindows.map((window, index) => (
                  <div className="form-grid form-grid-times" key={index}>
                    <span className="time-window-label">{timeWindows.length > 1 ? `Plage ${index + 1}` : 'Horaires préférés'}</span>
                    <label className="field field-time"><span className="sr-only">Heure de début, plage {index + 1}</span><input aria-label={`Heure de début, plage ${index + 1}`} onChange={(event) => updateTimeWindow(index, 'start', event.target.value)} required type="time" value={window.start} /></label>
                    <span className="time-separator">à</span>
                    <label className="field field-time"><span className="sr-only">Heure de fin, plage {index + 1}</span><input aria-label={`Heure de fin, plage ${index + 1}`} onChange={(event) => updateTimeWindow(index, 'end', event.target.value)} required type="time" value={window.end} /></label>
                    {timeWindows.length > 1 && <button aria-label={`Supprimer la plage ${index + 1}`} className="remove-window" onClick={() => { clearSearchResults(); setTimeWindows((current) => current.filter((_, itemIndex) => itemIndex !== index)) }} type="button"><Icon name="close" size={17} /></button>}
                  </div>
                ))}
                {timeWindows.length < 2 && <button className="add-window" onClick={() => { clearSearchResults(); setTimeWindows((current) => [...current, { start: '16:00', end: '20:00' }]) }} type="button"><Icon name="plus" size={15} /> Ajouter une plage horaire</button>}
              </div>

              {searchError && <p className="form-error" role="alert">{searchError}</p>}

              <div className="search-submit-row">
                <p><Icon name="shield" size={16} /> Vos critères servent uniquement à trouver un tuteur adapté.</p>
                <button className="button button-primary search-button" disabled={catalogLoading || searching} type="submit">
                  {searching ? <><span className="spinner" /> Recherche en cours…</> : <>Voir les tuteurs compatibles <Icon name="arrow" size={18} /></>}
                </button>
              </div>
            </form>
          )}
        </section>

        {matches !== null && (
          <section aria-live="polite" className="results-section" id="resultats">
            <div className="results-heading">
              <div>
                <span className="section-kicker">Votre sélection personnalisée</span>
                <h2>{matches.length ? `${matches.length} ${matches.length > 1 ? 'tuteurs correspondent' : 'tuteur correspond'}` : 'Aucun tuteur trouvé pour le moment'}</h2>
                <p>{matches.length ? <>Pour <b>{subjectLabel}</b> · niveau <b>{gradeLabel}</b> · {searchCriteria?.searchedDays} jours de disponibilités</> : 'Essayez d’élargir la période ou les horaires demandés.'}</p>
              </div>
              {matches.length > 0 && <label className="sort-control"><span>Trier par</span><span className="select-wrap"><select onChange={(event) => setSort(event.target.value)} value={sort}><option value="score">Meilleure pertinence</option><option value="rating">Meilleures notes</option><option value="experience">Plus d’expérience</option></select><Icon className="select-chevron" name="chevron" size={15} /></span></label>}
            </div>

            {matches.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon"><Icon name="search" size={25} /></span>
                <div><b>Modifiez un peu vos critères</b><p>Essayez une plage horaire plus large ou ajoutez quelques jours à votre période.</p></div>
                <a className="button button-secondary" href="#recherche">Modifier ma recherche</a>
              </div>
            ) : (
              <div className="results-layout">
                <div className="tutor-list">
                  {sortedMatches.map((tutor, index) => (
                    <article className={`tutor-card${index === 0 ? ' tutor-card-first' : ''}`} key={tutor.id}>
                      {index === 0 && <div className="card-accent" />}
                      <div className="tutor-card-top">
                        <TutorAvatar tutor={tutor} large />
                        <div className="tutor-info">
                          <div className="tutor-title-row">
                            <div><h3>{tutor.first_name} {tutor.last_name}</h3><span className="tutor-subtitle">Tuteur particulier · cours en ligne</span></div>
                            <div className="score-badge"><Icon name="spark" size={15} /><span>{Math.round(tutor.matching_score)}<small>%</small></span><small>pertinence</small></div>
                          </div>
                          <div className="tutor-metrics">
                            <span className="metric-rating"><Icon name="star" size={15} /> {Number(tutor.rating).toFixed(1)} <small>sur 5</small></span>
                            <span><Icon name="book" size={15} /> {tutor.experience_years} ans d’expérience</span>
                            <span><Icon name="check" size={15} /> {tutor.completed_lessons} cours réalisés</span>
                          </div>
                        </div>
                      </div>

                      <p className="tutor-bio">{tutor.bio}</p>
                      <div className="tutor-tags">
                        {tutor.subjects.map((subject) => <span className={`subject-tag${subject.id === searchCriteria?.subjectId ? ' subject-tag-selected' : ''}`} key={subject.id}>{subject.name}</span>)}
                        {tutor.school_levels.some((level) => level.id === searchCriteria?.schoolLevelId) && <span className="level-tag"><Icon name="school" size={13} /> Niveau {gradeLabel}</span>}
                      </div>

                      <div className="slot-area">
                        <div className="slot-heading"><span><Icon name="calendar" size={16} /> Créneaux disponibles</span><small>{tutor.available_slots.length} au choix</small></div>
                        <div className="slot-list">
                          {tutor.available_slots.map((slot) => {
                            const formatted = formatSlot(slot)
                            return (
                              <button className="slot-button" key={slot.id} onClick={() => openBooking(tutor, slot)} type="button">
                                <span>{formatted.day}</span><b>{formatted.time}</b><Icon name="arrow" size={14} />
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      <div className="card-footer"><span><Icon name="check" size={15} /> Matière, niveau et créneau compatibles</span><button className="text-action" onClick={() => openBooking(tutor, tutor.available_slots[0])} type="button">Choisir ce tuteur <Icon name="arrow" size={15} /></button></div>
                    </article>
                  ))}
                </div>

                <aside className="results-aside">
                  <div className="summary-card">
                    <div className="summary-top"><span className="summary-icon"><Icon name="spark" size={19} /></span><span>Votre recherche</span></div>
                    <h3>Un accompagnement<br />à la bonne mesure.</h3>
                    <div className="summary-lines">
                      <div><span>Matière</span><b>{subjectLabel}</b></div>
                      <div><span>Niveau</span><b>{gradeLabel}</b></div>
                      <div><span>Disponibilité</span><b>{searchCriteria?.searchedDays} jours · {searchCriteria?.timeWindowsCount} plage{searchCriteria?.timeWindowsCount > 1 ? 's' : ''}</b></div>
                    </div>
                    <div className="summary-note"><Icon name="shield" size={16} /><span>Les critères essentiels sont vérifiés avant le classement des profils.</span></div>
                  </div>
                  <div className="how-card" id="fonctionnement">
                    <div className="how-heading"><span><Icon name="sparkleCheck" size={17} /></span><b>Comment fonctionne le matching ?</b></div>
                    <p>Nous vérifions d’abord les trois critères indispensables, puis classons les profils selon leur expérience et les retours de leurs élèves.</p>
                    <div className="score-legend"><div><span>Note moyenne</span><b>50 pts</b></div><div className="legend-track"><i style={{ width: '50%' }} /></div><div><span>Expérience</span><b>30 pts</b></div><div className="legend-track"><i style={{ width: '30%' }} /></div><div><span>Cours réalisés</span><b>20 pts</b></div><div className="legend-track"><i style={{ width: '20%' }} /></div></div>
                  </div>
                </aside>
              </div>
            )}
          </section>
        )}

        <section className="steps-strip">
          <div className="step-item"><span className="step-icon"><Icon name="school" size={18} /></span><span><b>Décrivez vos besoins</b><small>Matière, niveau, horaires</small></span></div>
          <span className="step-arrow"><Icon name="arrow" size={16} /></span>
          <div className="step-item"><span className="step-icon"><Icon name="spark" size={18} /></span><span><b>Comparez les profils</b><small>Des tuteurs compatibles</small></span></div>
          <span className="step-arrow"><Icon name="arrow" size={16} /></span>
          <div className="step-item"><span className="step-icon"><Icon name="calendar" size={18} /></span><span><b>Réservez en confiance</b><small>Confirmation immédiate</small></span></div>
        </section>
      </main>

      <footer className="footer"><a className="brand footer-brand" href="#top"><span className="brand-mark"><Icon name="book" size={18} /></span><span>Tutora<span className="brand-period">.</span></span></a><span>Un soutien scolaire qui trouve sa place dans votre quotidien.</span><span>© {new Date().getFullYear()} Tutora</span></footer>

      {selectedSlot && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeBooking() }}>
          <section aria-labelledby="booking-title" aria-modal="true" className="booking-modal" role="dialog">
            <button aria-label="Fermer" className="modal-close" disabled={bookingLoading} onClick={closeBooking} type="button"><Icon name="close" size={19} /></button>
            {booking ? (
              <div className="booking-success">
                <div className="success-mark"><Icon name="check" size={30} /></div>
                <span className="section-kicker">C’est confirmé</span>
                <h2 id="booking-title">Le cours est réservé !</h2>
                <p className="success-intro">{booking.student_name} retrouvera {booking.tutor.first_name} {booking.tutor.last_name} pour son cours de {booking.subject.name}.</p>
                <div className="confirmation-card"><span><Icon name="calendar" size={17} /> {formatFullDate(booking.starts_at)}</span><span><Icon name="school" size={17} /> Niveau {booking.school_level.name}</span><small>Référence : {booking.reference}</small></div>
                <p className="success-footnote">Conservez cette référence pour retrouver les détails de votre réservation.</p>
                <button className="button button-primary modal-submit" onClick={closeBooking} type="button">Terminer <Icon name="arrow" size={17} /></button>
              </div>
            ) : (
              <>
                <div className="modal-heading"><span className="modal-icon"><Icon name="calendar" size={20} /></span><span className="section-kicker">Dernière étape</span><h2 id="booking-title">Réservez votre cours</h2><p>Votre séance sera confirmée dès validation.</p></div>
                <div className="booking-recap">
                  <TutorAvatar tutor={selectedSlot.tutor} />
                  <span><b>{selectedSlot.tutor.first_name} {selectedSlot.tutor.last_name}</b><small>{selectedSlot.criteria.subjectName} · Niveau {selectedSlot.criteria.schoolLevelName}</small><small>{formatFullDate(selectedSlot.slot.starts_at)}</small></span>
                  <span className="recap-check"><Icon name="check" size={16} /></span>
                </div>
                <form className="booking-form" onSubmit={submitBooking}>
                  <label className="field"><span className="field-label">Nom de l’enfant</span><input autoComplete="name" maxLength="120" name="student_name" onChange={updateBookingForm} placeholder="Ex. Alex Martin" required value={bookingForm.student_name} /></label>
                  <div className="form-grid form-grid-booking">
                    <label className="field"><span className="field-label">Votre nom</span><input autoComplete="name" maxLength="120" name="parent_name" onChange={updateBookingForm} placeholder="Ex. Camille Martin" required value={bookingForm.parent_name} /></label>
                    <label className="field"><span className="field-label">Votre e-mail</span><input autoComplete="email" maxLength="255" name="parent_email" onChange={updateBookingForm} placeholder="vous@exemple.fr" required type="email" value={bookingForm.parent_email} /></label>
                  </div>
                  <label className="field"><span className="field-label">Un mot pour le tuteur <small>(facultatif)</small></span><textarea maxLength="1000" name="notes" onChange={updateBookingForm} placeholder="Un objectif ou un point à travailler…" rows="3" value={bookingForm.notes} /></label>
                  {bookingError && <p className="form-error" role="alert">{bookingError}</p>}
                  <p className="booking-privacy"><Icon name="shield" size={15} /> Vos informations restent liées à cette réservation.</p>
                  <button className="button button-primary modal-submit" disabled={bookingLoading} type="submit">{bookingLoading ? <><span className="spinner" /> Confirmation…</> : <>Confirmer la réservation <Icon name="arrow" size={17} /></>}</button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default App
