import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { JacketIcon, DressIcon, ChildIcon, AbayaIcon, HouseholdIcon, AllIcon } from './icons.jsx'
import api from '../lib/api.js'

const DEFAULT_CHIPS = [
  { cat: 'رجالي', label: 'رجالي', Icon: JacketIcon },
  { cat: 'نسائي', label: 'نسائي', Icon: AbayaIcon },
  { cat: 'أطفال', label: 'أطفال', Icon: ChildIcon },
  { cat: 'فساتين', label: 'فساتين', Icon: DressIcon },
  { cat: 'بيتي', label: 'بيتي', Icon: HouseholdIcon },
  { cat: null, label: 'الكل', Icon: AllIcon }
]

export default function CategoryChips() {
  const [chips, setChips] = useState(DEFAULT_CHIPS)

  useEffect(() => {
    api.getPublicSettings()
      .then((data) => {
        if (data?.custom_categories_detail) {
          try {
            const parsed = typeof data.custom_categories_detail === 'string' ? JSON.parse(data.custom_categories_detail) : data.custom_categories_detail
            if (Array.isArray(parsed) && parsed.length > 0) {
              const dyn = parsed.map((c) => ({
                cat: c.name,
                label: c.name,
                image_url: c.image_url || '',
                Icon: JacketIcon
              }))
              dyn.push({ cat: null, label: 'الكل', Icon: AllIcon })
              setChips(dyn)
            }
          } catch { /* fallback */ }
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="cats">
      {chips.map(({ cat, label, image_url, Icon }) => (
        <Link key={label || cat} className="cat-chip" to={cat ? `/catalog?cat=${encodeURIComponent(cat)}` : '/catalog'}>
          {image_url ? (
            <span className="icon-wrap" style={{ borderRadius: '50%', overflow: 'hidden', padding: 0, width: 22, height: 22 }}>
              <img src={image_url} alt={label || cat} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </span>
          ) : (
            <span className="icon-wrap"><Icon width={16} height={16} /></span>
          )}
          <span>{label || cat}</span>
        </Link>
      ))}
    </div>
  )
}
