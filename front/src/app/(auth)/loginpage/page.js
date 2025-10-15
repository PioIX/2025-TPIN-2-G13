"use client"

import styles from "@/app/(auth)/loginpage/login.module.css"
import Button from "@/components/Button";
import Input from "@/components/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";



export default function Login() {
    
    const [mostrarMensaje, setMostrarMensaje] = useState(false);
    const [textoMensaje, setTextoMensaje] = useState("");

    const showModal = (title, message) => {
    setTextoMensaje(`${title}: ${message}`);
    setMostrarMensaje(true);
    setTimeout(() => setMostrarMensaje(false), 3000); 
    };

    const [usuarios, setUsuarios] = useState([])
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter()

    
    useEffect(() => {
        fetch("http://localhost:4006/users")
            .then(response => response.json())
            .then(result => {
                console.log(result)
                setUsuarios(result)
            })
    }, [])


    function SignIn() {
        try {

            if (!user || !password) {
                showModal("Error", "Debes completar todos los campos")
                return
            }

            for (let i = 0; i < usuarios.length; i++) {
                if (usuarios[i].mail == user) {
                    if (usuarios[i].contraseña == password) {
                        sessionStorage.setItem("isLoggedIn", "true"); // guardar login
                        showModal("Has iniciado Sesión", "Enseguida estarás en la app")
                        fetch('http://localhost:4006/findUserId', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ mail: user })
                        })
                            .then(response => response.json())
                            .then(data => {
                                sessionStorage.setItem("userId", data[0].id_usuario); // guardar userId 
                                console.log("userId guardado en sessionStorage:", data[0].id_usuario);
                                router.replace("./../chat")
                            })
                    } else {
                        showModal("Error", "Contraseña o Usuario Incorrecto")
                    }
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    function savePassword(event) {
        setPassword(event.target.value)
    }

    function saveUser(event) {
        setUser(event.target.value)
    }

    function handleKeyDown(event) {
        if (event.key === "Enter") {
            SignIn(); // Llamar a la función para enviar el mensaje
        }
    }

    return (
        <div className={styles.contenedorLogin}>
            <div className={styles.contenedorFormLogin}>
                <h1>Login</h1>
                <Input placeholder="Escriba su email" id="email" page="login" type="email" onChange={saveUser} name="mail" text="Correo electrónico" />
                <Input placeholder="Escriba su contraseña" id="password" page="login" type="password" onChange={savePassword} name="contraseña" text="Contraseña" onKeyDown={handleKeyDown}/>
                <Button text="Sign In" onClick={SignIn} page="login"></Button>
                <h3>¿Es la primera vez que ingresas?</h3>
                <Link href="./register" className={styles.linkLogin}>Registrarse</Link>
            </div>
            {mostrarMensaje && (
            <div className={styles.mensaje}>
                {textoMensaje}
            </div>
        )}
        </div>
    );
}
