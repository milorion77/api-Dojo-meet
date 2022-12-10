import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'

export const PublicLayout = () => {
    return (
        <>
            {/*LAYOUT */}
            <Header />

            {/* Contenido principal */}
            <section className="layout__content">
                <Outlet/> {/*Outlet son todos los componentes que cargue cada ruta */}
            </section>
        </>
    )
}
