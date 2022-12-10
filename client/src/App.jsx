//import { useState } from 'react'
//import { Header } from './componentes/Layaout/publico/Header';
import {Routing} from './router/Routing';
const App = () => {
  return (
    <div className="layout">
      {/*Aqui estoy cargando toda la configuracion de rutas */}
      <Routing/>
      
    </div>
  )
}

export default App;