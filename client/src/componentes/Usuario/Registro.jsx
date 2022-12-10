import React from 'react'
import { useState } from 'react';
import { Global } from '../../helpers/Global';
import { useForm } from '../../hooks/useForm'

export const Registro = () => {

    const { form, cambiado } = useForm({});
    const [guardado, setGuardado] = useState("not_sended") // recordar que useState devuelve un array y no un objeto y useForm objeto

    const saveUser = async (e) => {
        //Prevenir actualizacion de pantalla
        e.preventDefault();

        // Recoger datos delformulario
        let nuevoUsuario = form;

        //Guardar usuario en el backend
        const request = await fetch(Global.url + "register", {
            method: "POST",
            body: JSON.stringify(nuevoUsuario), //se tiene que transformar en un json para poder enviarse
            headers: {
                "Content-Type": "application/json",
            }
        });

        const data = await request.json();

        if (data.status == "success") {
            setGuardado("saved");
        } else {
            setGuardado("error");
        }
    }//Fin del metodo de guardar 

    return (
        <>
            <header className="content__header content__header--public">
                <h1 className="content__title">Registro</h1>
            </header>

            <div className="content__posts">
                {guardado == "saved" ?
                    <strong className='alert alert-success'>Usuario registrado correctamente!!</strong>
                : ''}

                {guardado == "error" ?
                    <strong className='alert alert-danger'>Usuario no se ha registrado!!</strong>
                : ''}

                <form className='register-form' onSubmit={saveUser}>

                    <div className="form-group">
                        <label htmlFor='firstName'>Nombre</label>
                        <input type="text" name='firstName' onChange={cambiado} />
                    </div>
                    <div className="form-group">
                        <label htmlFor='lastName'>Apellidos</label>
                        <input type="text" name='lastName' onChange={cambiado} />
                    </div>
                    <div className="form-group">
                        <label htmlFor='nick'>Nombre de Usuario</label>
                        <input type="text" name='nick' onChange={cambiado} />
                    </div>
                    <div className="form-group">
                        <label htmlFor='email'>Email</label>
                        <input type="email" name='email' onChange={cambiado} />
                    </div>
                    <div className="form-group">
                        <label htmlFor='password'>Contraseña</label>
                        <input type="password" name='password' onChange={cambiado} />
                    </div>

                    <input type="submit" value="Registrate" className='btn btn-success' />
                </form>
            </div>
        </>
    )
}
