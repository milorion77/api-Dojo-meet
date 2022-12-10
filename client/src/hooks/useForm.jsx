import React from 'react'
import { useState } from 'react';

export const useForm = (initialObj = {}) => {
    const [form, setForm] = useState(initialObj);

    const cambiado = ({target}) => {
        const {name, value} = target;

        setForm({
            ...form,
            [name]: value
        });
    }
    return {
        form,
        cambiado
    };
}
