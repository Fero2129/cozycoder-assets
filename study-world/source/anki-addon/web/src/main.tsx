import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/nunito'
import '../../../apps/web/src/styles.css'
import './addon.css'
import { FocusBarView } from './FocusBarView.tsx'
import { LibraryApp } from './LibraryApp.tsx'
import { requestState } from './store.ts'

const view = new URLSearchParams(location.search).get('view') ?? 'world'
document.documentElement.classList.add(`lw-${view}`)

createRoot(document.getElementById('root')!).render(<StrictMode>{view === 'bar' ? <FocusBarView /> : <LibraryApp />}</StrictMode>)
requestState()
