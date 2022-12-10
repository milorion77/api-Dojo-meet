import React from 'react';
import { Routes, Route, BrowserRouter, Navigate, Link } from 'react-router-dom';
import { LayaoutPrivado } from '../componentes/Layaout/privado/LayoutPrivado';
import { PublicLayout } from '../componentes/Layaout/publico/PublicLayout';
import { Feed } from '../componentes/Publicacion/Feed';
import { Login } from '../componentes/Usuario/Login';
import { Registro } from '../componentes/Usuario/Registro';

export const Routing = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<PublicLayout />}>
                    <Route index element={<Login />} />
                    <Route path="login" element={<Login />} />
                    <Route path="registro" element={<Registro />} />
                </Route>
                {/*Esto es una ruta anidada entonces sus path no pueden tener una barra lateral */}
                <Route path="/social" element={<LayaoutPrivado />}>
                    <Route index element={<Feed />} />
                    <Route path="feed" element={<Feed />} />

                </Route> {/* cualquier ruta con path= "*" refiere a una ruta desconocida, se aprovecha para que nos saque el error jaja */}
                <Route path='*' element={
                    <>
                        <p>
                            <h1>Error 404, aqui no hay nada de ná 😅</h1>
                            <Link to="/"> Volver al inicio</Link>
                        </p>
                    </>
                } />
            </Routes>
        </BrowserRouter>
    )
}
