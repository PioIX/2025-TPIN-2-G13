"use client"

import styles from "@/app/(auth)/register/register.module.css"
import Button from "@/components/Button";
import Input from "@/components/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Register() {

    const [nombre, SetNombre] = useState("")
    const [contraseña, SetContraseña] = useState("")
    const [confirmContraseña, setConfirmContraseña] = useState("")
    const [fotoPerfil, SetFotoPerfil] = useState(null)
    const [usuario, setUsuario] = useState([])

    const router = useRouter()

    const [mostrarMensaje, setMostrarMensaje] = useState(false);
    const [textoMensaje, setTextoMensaje] = useState("");

    const showModal = (title, message) => {
    setTextoMensaje(`${title}: ${message}`);
    setMostrarMensaje(true);
    setTimeout(() => setMostrarMensaje(false), 3000); 
    };



    
    useEffect(() => {
        if (usuario.existe == false) {
            SignUp()
        } else if (usuario.existe == true) {
            showModal("Error", "Ya existe un usuario con ese mail")
        }
    }, [usuario])


    function saveName(event) {
        SetNombre(event.target.value)
    }
    function savePassowrd(event) {
        SetContraseña(event.target.value)
    }
    function savePassowrdSecure(event) {
        setConfirmContraseña(event.target.value)
    }
    function saveImage(event) {
        SetFotoPerfil(event.target.value)
    }

    function UserExists() {

            if (!nombre || !contraseña) {
                showModal("Error", "Complete todos los campos por favor")
                return
            }

            fetch("http://localhost:4006/findUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: nombre
                })
            })
            .then(response => response.json())
            .then(result => {
                setUsuario(result)
            })
    }

    function SignUp() { 

        const userData = {
            username: nombre,
            password: contraseña,
            image: fotoPerfil,
        }

        if (contraseña === confirmContraseña) {
            fetch("http://localhost:4006/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            })
            .then(response => response.json())
            .then(result => {
                showModal("Exito", "Usuario creado correctamente")
                sessionStorage.setItem("isLoggedIn", "true"); 
                fetch('http://localhost:4006/findUserId', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: nombre })
                    })
                        .then(response => response.json())
                        .then(data => {
                            sessionStorage.setItem("userId", data[0].id_user); // guardar userId 
                            console.log("userId guardado en sessionStorage:", data[0].id_user);
                            router.replace("/Kabegol/Home") // redirigir a Home
                        })
        })
        } else {
            showModal("Error", "Las contraseñas no coinciden")
        }
    }
            
    return (
        <div className={styles.contenedorRegister}>
            <div className={styles.registerForm}>
                <h1>Registro</h1>
                <br></br>
                <p>Complete los siguientes datos para el registro</p>

                <Input text="Username" placeholder="Escriba su nombre de usuario" page="register" type="text" onChange={saveName} required={true}/>
                <Input text="Contraseña" placeholder="Escriba su contraseña" page="register" type="password" onChange={savePassowrd} required={true}/>
                <Input text="Confirmar Contraseña" placeholder="Escriba de vuelta su contraseña" page="register" type="password" onChange={savePassowrdSecure} required={true}/>
                <Input text="Foto de perfil (enlace público)" placeholder="Agregue su foto de perfil" page="register" type="text" onChange={saveImage} required={false}/>

                <Button onClick={UserExists} text="Sign Up" page="register"></Button>
                <Link href={"./login"} className={styles.linkRegister}>¿Ya tenes cuenta? Login</Link>
            </div>

            {mostrarMensaje && (
            <div className={styles.mensaje}>
                {textoMensaje}
            </div>)}


        </div>
        
    );
}   