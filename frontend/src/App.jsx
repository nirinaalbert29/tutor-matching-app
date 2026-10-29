import { useCallback, useEffect, useState } from 'react'
import BookingModal from './components/BookingModal'
import Icon from './components/Icon'
import TutorResults from './components/TutorResults'
import TutorSearchForm from './components/TutorSearchForm'
import { apiRequest } from './lib/api'
import './App.css'

function App() {
  const [catalog, setCatalog] = useState({ subjects: [], school_levels: [] })
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [matches, setMatches] = useState(null)
  const [searchCriteria, setSearchCriteria] = useState(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [booking, setBooking] = useState(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')

  const fetchCatalog = useCallback(() => apiRequest('/catalog'), [])

  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true)
    setCatalogError('')
    try {
      setCatalog(await fetchCatalog())
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
        if (!cancelled) setCatalog(data)
      })
      .catch((error) => {
        if (!cancelled) setCatalogError(error.message)
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false)
      })

    return () => { cancelled = true }
  }, [fetchCatalog])

  function clearSearchResults() {
    setMatches(null)
    setSearchCriteria(null)
    setSearchError('')
  }

  async function searchTutors(criteria) {
    setSearching(true)
    clearSearchResults()

    try {
      const result = await apiRequest('/matches', {
        method: 'POST',
        body: JSON.stringify({
          subject_id: criteria.subjectId,
          school_level_id: criteria.schoolLevelId,
          availability: criteria.availability,
        }),
      })
      setSearchCriteria({
        subjectId: result.criteria.subject.id,
        subjectName: result.criteria.subject.name,
        schoolLevelId: result.criteria.school_level.id,
        schoolLevelName: result.criteria.school_level.name,
        searchedDays: criteria.searchedDays,
        timeWindowsCount: criteria.timeWindowsCount,
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
  }

  function closeBooking() {
    if (bookingLoading) return
    setSelectedSlot(null)
    setBooking(null)
    setBookingError('')
  }

  async function confirmBooking(form) {
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
          ...form,
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
          <TutorSearchForm
            catalog={catalog}
            catalogError={catalogError}
            catalogLoading={catalogLoading}
            onCriteriaChange={clearSearchResults}
            onRetry={loadCatalog}
            onSearch={searchTutors}
            searching={searching}
            serverError={searchError}
          />
        </section>

        {matches !== null && searchCriteria && (
          <TutorResults criteria={searchCriteria} matches={matches} onBook={openBooking} />
        )}

        <section className="steps-strip">
          <div className="step-item"><span className="step-icon"><Icon name="school" size={18} /></span><span><b>Décrivez vos besoins</b><small>Matière, niveau, horaires</small></span></div>
          <span className="step-arrow"><Icon name="arrow" size={16} /></span>
          <div className="step-item"><span className="step-icon"><Icon name="spark" size={18} /></span><span><b>Comparez les profils</b><small>Des tuteurs compatibles</small></span></div>
          <span className="step-arrow"><Icon name="arrow" size={16} /></span>
          <div className="step-item"><span className="step-icon"><Icon name="calendar" size={18} /></span><span><b>Réservez en confiance</b><small>Confirmation immédiate</small></span></div>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#top"><span className="brand-mark"><Icon name="book" size={18} /></span><span>Tutora<span className="brand-period">.</span></span></a>
        <span>Un soutien scolaire qui trouve sa place dans votre quotidien.</span>
        <span>© {new Date().getFullYear()} Tutora</span>
      </footer>

      {selectedSlot && (
        <BookingModal
          booking={booking}
          bookingError={bookingError}
          bookingLoading={bookingLoading}
          key={selectedSlot.slot.id}
          onClose={closeBooking}
          onConfirm={confirmBooking}
          selectedSlot={selectedSlot}
        />
      )}
    </div>
  )
}

export default App
