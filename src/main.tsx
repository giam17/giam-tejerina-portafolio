import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/unbounded/latin-900.css'
import '@fontsource/unbounded/latin-500.css'
import '@fontsource/unbounded/latin-700.css'
import '@fontsource/space-grotesk/latin-500.css'
import '@fontsource/space-grotesk/latin-700.css'
import '@fontsource/dancing-script/latin-700.css'
import '@fontsource/dm-sans/latin-400.css'
import '@fontsource/dm-sans/latin-700.css'
import '@fontsource/league-spartan/latin-700.css'
import '@fontsource/changa-one/latin-400.css'
import '@fontsource/denk-one/latin-400.css'
import '@fontsource/titan-one/latin-400.css'
import '@fontsource/bungee-shade/latin-400.css'
import '@fontsource/bowlby-one/latin-400.css'
import '@fontsource/bowlby-one-sc/latin-400.css'
import '@fontsource/manrope/latin-500.css'
import { Portada } from './portada/Portada'
import { SobreMi } from './sobre-mi/SobreMi'
import { MisProyectos } from './mis-proyectos/MisProyectos'
import { Museo } from './museo/Museo'
import { Personajes } from './personajes/Personajes'
import { Educa } from './educa/Educa'
import { Contacto } from './contacto/Contacto'
import { MobileExperience } from './MobileExperience'
import './styles.css'
import './mobile.css'
import './mobile-collage.css'
import { DesktopExperience } from './DesktopExperience'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <main>
      <Portada />
      <SobreMi />
      <MisProyectos />
      <Museo />
      <Personajes />
      <Educa />
      <Contacto />
    </main>
    <MobileExperience />
    <DesktopExperience />
  </React.StrictMode>,
)
