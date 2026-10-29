import { useState } from 'react'
import { formatFullDate } from '../lib/api'
import Icon from './Icon'
import TutorAvatar from './TutorAvatar'

const emptyForm = {
  parent_name: '',
  parent_email: '',
  student_name: '',
  notes: '',
}

export default function BookingModal({
  selectedSlot,
  booking,
  bookingLoading,
  bookingError,
  onClose,
  onConfirm,
}) {
  const [form, setForm] = useState(emptyForm)

  function updateForm(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function submit(event) {
    event.preventDefault()
    onConfirm(form)
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section aria-labelledby="booking-title" aria-modal="true" className="booking-modal" role="dialog">
        <button aria-label="Fermer" className="modal-close" disabled={bookingLoading} onClick={onClose} type="button"><Icon name="close" size={19} /></button>
        {booking ? (
          <div className="booking-success">
            <div className="success-mark"><Icon name="check" size={30} /></div>
            <span className="section-kicker">C’est confirmé</span>
            <h2 id="booking-title">Le cours est réservé !</h2>
            <p className="success-intro">{booking.student_name} retrouvera {booking.tutor.first_name} {booking.tutor.last_name} pour son cours de {booking.subject.name}.</p>
            <div className="confirmation-card">
              <span><Icon name="calendar" size={17} /> {formatFullDate(booking.starts_at)}</span>
              <span><Icon name="school" size={17} /> Niveau {booking.school_level.name}</span>
              <small>Référence : {booking.reference}</small>
            </div>
            <p className="success-footnote">Conservez cette référence pour retrouver les détails de votre réservation.</p>
            <button className="button button-primary modal-submit" onClick={onClose} type="button">Terminer <Icon name="arrow" size={17} /></button>
          </div>
        ) : (
          <>
            <div className="modal-heading">
              <span className="modal-icon"><Icon name="calendar" size={20} /></span>
              <span className="section-kicker">Dernière étape</span>
              <h2 id="booking-title">Réservez votre cours</h2>
              <p>Votre séance sera confirmée dès validation.</p>
            </div>
            <div className="booking-recap">
              <TutorAvatar tutor={selectedSlot.tutor} />
              <span>
                <b>{selectedSlot.tutor.first_name} {selectedSlot.tutor.last_name}</b>
                <small>{selectedSlot.criteria.subjectName} · Niveau {selectedSlot.criteria.schoolLevelName}</small>
                <small>{formatFullDate(selectedSlot.slot.starts_at)}</small>
              </span>
              <span className="recap-check"><Icon name="check" size={16} /></span>
            </div>
            <form className="booking-form" onSubmit={submit}>
              <label className="field">
                <span className="field-label">Nom de l’enfant</span>
                <input autoComplete="name" maxLength="120" name="student_name" onChange={updateForm} placeholder="Ex. Alex Martin" required value={form.student_name} />
              </label>
              <div className="form-grid form-grid-booking">
                <label className="field">
                  <span className="field-label">Votre nom</span>
                  <input autoComplete="name" maxLength="120" name="parent_name" onChange={updateForm} placeholder="Ex. Camille Martin" required value={form.parent_name} />
                </label>
                <label className="field">
                  <span className="field-label">Votre e-mail</span>
                  <input autoComplete="email" maxLength="255" name="parent_email" onChange={updateForm} placeholder="vous@exemple.fr" required type="email" value={form.parent_email} />
                </label>
              </div>
              <label className="field">
                <span className="field-label">Un mot pour le tuteur <small>(facultatif)</small></span>
                <textarea maxLength="1000" name="notes" onChange={updateForm} placeholder="Un objectif ou un point à travailler…" rows="3" value={form.notes} />
              </label>
              {bookingError && <p className="form-error" role="alert">{bookingError}</p>}
              <p className="booking-privacy"><Icon name="shield" size={15} /> Vos informations restent liées à cette réservation.</p>
              <button className="button button-primary modal-submit" disabled={bookingLoading} type="submit">
                {bookingLoading ? <><span className="spinner" /> Confirmation…</> : <>Confirmer la réservation <Icon name="arrow" size={17} /></>}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
