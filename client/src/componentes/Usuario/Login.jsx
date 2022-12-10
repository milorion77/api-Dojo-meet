import React from 'react'
import { Global } from '../../helpers/Global';
import { useForm } from '../../hooks/useForm'

export const Login = () => {

    const { form, cambiado } = useForm({});

    const loginUser = async (e) => {
        //Prevenir actualizacion de pantalla
        e.preventDefault();

        //Datos del formulario
        //let usuarioLogin = form;

        //Peticion al backend
        const request = await fetch(Global.url + 'login' , {
            method: "POST",
            Body: JSON.stringify(form),
            header: {
                "Content-Type": "application/json"
            }
        });
        const data = await request.json();

        //Persistir los datos en el navegador
        console.log(data);

    }

    return (
        <>
            <header className="content__header content__header--public">
                <h1 className="content__title">Login</h1>
            </header>
            <div className="content__posts">

                <form className='form-login' onSubmit={loginUser}>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" name="email" onChange={cambiado} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input type="password" name="password" onChange={cambiado} />
                    </div>

                    <input type="submit" value="Iniciar Sesión" className='btn btn-success' />
                </form>

            </div>
        </>
    )
}
