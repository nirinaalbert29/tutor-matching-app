import { useMemo, useState } from 'react'
import Icon from './Icon'
import TutorCard from './TutorCard'

export default function TutorResults({ matches, criteria, onBook }) {
  const [sort, setSort] = useState('score')

  const sortedMatches = useMemo(() => {
    const tutors = [...matches]
    if (sort === 'experience') tutors.sort((a, b) => b.experience_years - a.experience_years)
    if (sort === 'rating') tutors.sort((a, b) => b.rating - a.rating)
    if (sort === 'score') tutors.sort((a, b) => b.matching_score - a.matching_score)
    return tutors
  }, [matches, sort])

  return (
    <section aria-live="polite" className="results-section" id="resultats">
      <div className="results-heading">
        <div>
          <span className="section-kicker">Votre sélection personnalisée</span>
          <h2>{matches.length ? `${matches.length} ${matches.length > 1 ? 'tuteurs correspondent' : 'tuteur correspond'}` : 'Aucun tuteur trouvé pour le moment'}</h2>
          <p>{matches.length ? <>Pour <b>{criteria.subjectName}</b> · niveau <b>{criteria.schoolLevelName}</b> · {criteria.searchedDays} jours de disponibilités</> : 'Essayez d’élargir la période ou les horaires demandés.'}</p>
        </div>
        {matches.length > 0 && (
          <label className="sort-control">
            <span>Trier par</span>
            <span className="select-wrap">
              <select onChange={(event) => setSort(event.target.value)} value={sort}>
                <option value="score">Meilleure pertinence</option>
                <option value="rating">Meilleures notes</option>
                <option value="experience">Plus d’expérience</option>
              </select>
              <Icon className="select-chevron" name="chevron" size={15} />
            </span>
          </label>
        )}
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
              <TutorCard criteria={criteria} index={index} key={tutor.id} onBook={onBook} tutor={tutor} />
            ))}
          </div>

          <aside className="results-aside">
            <div className="summary-card">
              <div className="summary-top"><span className="summary-icon"><Icon name="spark" size={19} /></span><span>Votre recherche</span></div>
              <h3>Un accompagnement<br />à la bonne mesure.</h3>
              <div className="summary-lines">
                <div><span>Matière</span><b>{criteria.subjectName}</b></div>
                <div><span>Niveau</span><b>{criteria.schoolLevelName}</b></div>
                <div><span>Disponibilité</span><b>{criteria.searchedDays} jours · {criteria.timeWindowsCount} plage{criteria.timeWindowsCount > 1 ? 's' : ''}</b></div>
              </div>
              <div className="summary-note"><Icon name="shield" size={16} /><span>Les critères essentiels sont vérifiés avant le classement des profils.</span></div>
            </div>
            <div className="how-card" id="fonctionnement">
              <div className="how-heading"><span><Icon name="sparkleCheck" size={17} /></span><b>Comment fonctionne le matching ?</b></div>
              <p>Nous vérifions d’abord les trois critères indispensables, puis classons les profils selon leur expérience et les retours de leurs élèves.</p>
              <div className="score-legend">
                <div><span>Note moyenne</span><b>50 pts</b></div><div className="legend-track"><i style={{ width: '50%' }} /></div>
                <div><span>Expérience</span><b>30 pts</b></div><div className="legend-track"><i style={{ width: '30%' }} /></div>
                <div><span>Cours réalisés</span><b>20 pts</b></div><div className="legend-track"><i style={{ width: '20%' }} /></div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </section>
  )
}
