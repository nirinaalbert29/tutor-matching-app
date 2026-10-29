import { formatSlot } from '../lib/api'
import Icon from './Icon'
import TutorAvatar from './TutorAvatar'

export default function TutorCard({ tutor, index, criteria, onBook }) {
  return (
    <article className={`tutor-card${index === 0 ? ' tutor-card-first' : ''}`}>
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
        {tutor.subjects.map((subject) => (
          <span className={`subject-tag${subject.id === criteria.subjectId ? ' subject-tag-selected' : ''}`} key={subject.id}>
            {subject.name}
          </span>
        ))}
        {tutor.school_levels.some((level) => level.id === criteria.schoolLevelId) && (
          <span className="level-tag"><Icon name="school" size={13} /> Niveau {criteria.schoolLevelName}</span>
        )}
      </div>

      <div className="slot-area">
        <div className="slot-heading"><span><Icon name="calendar" size={16} /> Créneaux disponibles</span><small>{tutor.available_slots.length} au choix</small></div>
        <div className="slot-list">
          {tutor.available_slots.map((slot) => {
            const formatted = formatSlot(slot)
            return (
              <button className="slot-button" key={slot.id} onClick={() => onBook(tutor, slot)} type="button">
                <span>{formatted.day}</span><b>{formatted.time}</b><Icon name="arrow" size={14} />
              </button>
            )
          })}
        </div>
      </div>
      <div className="card-footer">
        <span><Icon name="check" size={15} /> Matière, niveau et créneau compatibles</span>
        <button className="text-action" onClick={() => onBook(tutor, tutor.available_slots[0])} type="button">
          Choisir ce tuteur <Icon name="arrow" size={15} />
        </button>
      </div>
    </article>
  )
}
