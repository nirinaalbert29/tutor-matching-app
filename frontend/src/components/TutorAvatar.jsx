import { useState } from 'react'

function initials(firstName = '', lastName = '') {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export default function TutorAvatar({ tutor, large = false }) {
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
