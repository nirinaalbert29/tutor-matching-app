import { useState } from 'react'
import { addDays, dateValue, localDateTimeToIso } from '../lib/api'
import Icon from './Icon'

const MAX_SEARCH_DAYS = 14

export default function TutorSearchForm({
  catalog,
  catalogLoading,
  catalogError,
  onRetry,
  onSearch,
  onCriteriaChange,
  searching,
  serverError,
}) {
  const today = dateValue(new Date())
  const [subjectId, setSubjectId] = useState('')
  const [levelId, setLevelId] = useState('')
  const [fromDate, setFromDate] = useState(addDays(today, 1))
  const [toDate, setToDate] = useState(addDays(today, 12))
  const [timeWindows, setTimeWindows] = useState([{ start: '08:00', end: '20:00' }])
  const [formError, setFormError] = useState('')

  const selectedSubjectId = subjectId || String(
    catalog.subjects.find((subject) => subject.name === 'Mathématiques')?.id
      || catalog.subjects[0]?.id
      || '',
  )
  const selectedLevelId = levelId || String(
    catalog.school_levels.find((level) => level.name === '3e')?.id
      || catalog.school_levels[0]?.id
      || '',
  )
  const selectedDays = fromDate && toDate
    ? Math.round((new Date(`${toDate}T12:00:00`) - new Date(`${fromDate}T12:00:00`)) / 86_400_000) + 1
    : 0

  function criteriaChanged() {
    setFormError('')
    onCriteriaChange()
  }

  function updateTimeWindow(index, field, value) {
    criteriaChanged()
    setTimeWindows((current) => current.map((window, windowIndex) => (
      windowIndex === index ? { ...window, [field]: value } : window
    )))
  }

  function submitSearch(event) {
    event.preventDefault()
    setFormError('')

    if (!selectedSubjectId || !selectedLevelId) {
      setFormError('Choisissez une matière et un niveau scolaire pour lancer la recherche.')
      return
    }
    if (!fromDate || !toDate || toDate < fromDate) {
      setFormError('La date de fin doit être égale ou postérieure à la date de début.')
      return
    }
    if (selectedDays > MAX_SEARCH_DAYS + 1) {
      setFormError(`Choisissez une période de ${MAX_SEARCH_DAYS + 1} jours maximum.`)
      return
    }
    if (timeWindows.some((window) => !window.start || !window.end || window.end <= window.start)) {
      setFormError('Chaque horaire doit se terminer après son heure de début.')
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

    onSearch({
      subjectId: Number(selectedSubjectId),
      schoolLevelId: Number(selectedLevelId),
      availability,
      searchedDays: selectedDays,
      timeWindowsCount: timeWindows.length,
    })
  }

  return (
    <>
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
          <button className="button button-secondary" onClick={onRetry} type="button"><Icon name="refresh" /> Réessayer</button>
        </div>
      ) : (
        <form className="search-panel" onSubmit={submitSearch}>
          <div className="form-grid form-grid-main">
            <label className="field">
              <span className="field-label"><Icon name="school" size={17} /> Niveau scolaire</span>
              <span className="select-wrap">
                <select disabled={catalogLoading} onChange={(event) => { criteriaChanged(); setLevelId(event.target.value) }} required value={selectedLevelId}>
                  <option value="">Choisir un niveau</option>
                  {catalog.school_levels.map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}
                </select>
                <Icon className="select-chevron" name="chevron" size={16} />
              </span>
            </label>
            <label className="field">
              <span className="field-label"><Icon name="book" size={17} /> Matière à travailler</span>
              <span className="select-wrap">
                <select disabled={catalogLoading} onChange={(event) => { criteriaChanged(); setSubjectId(event.target.value) }} required value={selectedSubjectId}>
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
              <input max={toDate || undefined} min={today} onChange={(event) => { criteriaChanged(); setFromDate(event.target.value) }} required type="date" value={fromDate} />
            </label>
            <label className="field">
              <span className="field-label field-label-muted">Jusqu’au</span>
              <input min={fromDate || today} onChange={(event) => { criteriaChanged(); setToDate(event.target.value) }} required type="date" value={toDate} />
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
                {timeWindows.length > 1 && <button aria-label={`Supprimer la plage ${index + 1}`} className="remove-window" onClick={() => { criteriaChanged(); setTimeWindows((current) => current.filter((_, itemIndex) => itemIndex !== index)) }} type="button"><Icon name="close" size={17} /></button>}
              </div>
            ))}
            {timeWindows.length < 2 && <button className="add-window" onClick={() => { criteriaChanged(); setTimeWindows((current) => [...current, { start: '16:00', end: '20:00' }]) }} type="button"><Icon name="plus" size={15} /> Ajouter une plage horaire</button>}
          </div>

          {(formError || serverError) && <p className="form-error" role="alert">{formError || serverError}</p>}

          <div className="search-submit-row">
            <p><Icon name="shield" size={16} /> Vos critères servent uniquement à trouver un tuteur adapté.</p>
            <button className="button button-primary search-button" disabled={catalogLoading || searching} type="submit">
              {searching ? <><span className="spinner" /> Recherche en cours…</> : <>Voir les tuteurs compatibles <Icon name="arrow" size={18} /></>}
            </button>
          </div>
        </form>
      )}
    </>
  )
}
