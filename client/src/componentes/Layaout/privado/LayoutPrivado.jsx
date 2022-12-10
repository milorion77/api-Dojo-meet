import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const LayaoutPrivado = () => {
    return (
        <>
            {/*LAYOUT */}
            <Header />

            {/* Contenido principal */}
            <section className="layout__content">
                <Outlet/> {/*Outlet son todos los componentes que cargue cada ruta */}
            </section>

            {/*barra lateral */}
            <Sidebar/>

        </>
    )
}