"use client"

import Button from "@/components/Button"
import Input from "@/components/Input"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import  styles from "@/app/(routes)/chat/chat.module.css"
import Contacto from "@/components/Contacto"
import Imagen from "@/components/Imagen"
import Mensaje from "@/components/Mensaje"
import Popup from "reactjs-popup"
import { useSocket } from "@/hooks/useSocket"


export default function Chat() {

    const router = useRouter()
    const [selectedContact, setSelectedContact] = useState(null)  // 👈 contacto elegido
    const [messages, setMessages] = useState([]) // 👈 historial de mensajes
    const [newMessage,setNewMessage] = useState("")
    const [isGroup, setIsGroup] = useState(false)
    const [isPopupOpen, setPopupOpen] = useState(false);
    const [mailInput, setMailInput] = useState("");
    const [contactos, setContactos] = useState([])
    const [busqueda, setBusqueda] = useState("")
    const [contactosFiltrados, setContactosFiltrados] = useState([]);

    const { socket, isConnected } = useSocket({withCredentials: true}, "http://localhost:4006") 
 

    // ----------------------------
    // 🔌 Conexión de sockets
    // ----------------------------

    useEffect(() => {
        if (!socket) return;

        // Recibir mensajes en tiempo real
        socket.on("newMessage", (data) => {
            console.log(data)
            setMessages((prev) => [...prev, {
                id_usuario: data.message.id_usuario || "otro",
                contenido: data.message.contenido,
                hora: data.message.hora
            }]);
        });

        // Ping de prueba
        socket.on("pingAll", (data) => {
            console.log("📢 Ping recibido:", data);
        });

        return () => {
            socket.off("newMessage");
            socket.off("pingAll");
        }
    }, [socket]);

    //Abrir el popup
    const openPopup = () => {
        setPopupOpen(true)
    }

    //Cerrar el popup
    const closePopup = () => {
        setPopupOpen(false)
        setMailInput("") //Limpia el input al cerrar el popup
    }

    useEffect(() => {
        try {
            const isLoggedIn = sessionStorage.getItem("isLoggedIn");
            if (isLoggedIn !== "true") {
                router.replace("./login")
            }
        } catch (error) {
            console.log(error)
        }
    }, [])


    useEffect(() => {
        fetch('http://localhost:4006/bringContacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_usuario: sessionStorage.getItem("userId") })
        })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                for (let i = 0; i < data.length; i++) {
                    for (let j = 0; j < data.length; j++) {
                        if (i != j && data[i].grupo == 1 && data[i].nom_grupo == data[j].nom_grupo) {
                            data.splice(j,1)
                        }
                    }
                }
                console.log("Filtrado: ", data)
                setContactos(data)
        })
        
    }, [])


    useEffect(() => {
    if (!busqueda) {
        // Si no hay búsqueda, mostramos todos
        setContactosFiltrados(contactos);
    } else {
        // Filtrar por nombre o grupo (insensible a mayúsculas/minúsculas)
        const auxiliar = contactos.filter((contacto) =>
            (contacto.grupo ? contacto.nom_grupo : contacto.nombre)
                .toLowerCase()
                .includes(busqueda.toLowerCase())
        );
        setContactosFiltrados(auxiliar);
    }
}, [busqueda, contactos]);


    useEffect(() => { 
        try {
            fetch("http://localhost:4006/putOnline", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        id_usuario: sessionStorage.getItem("userId"),
                        en_linea: true
                    })
                })
                .then(response => response.json())
                .then(result => {
                    console.log("Se ha puesto en línea");    
            })
        } catch (error) {
            console.log(error)
        }
    }, [])

    function handleKeyDown(event) {
        if (event.key === "Enter") {
            sendNewMessage(); // Llamar a la función para enviar el mensaje
        }
    }

    function handleSelectContact(contact){
        
        
        setSelectedContact(contact)

        try {
            // traer historial de mensajes
            fetch("http://localhost:4006/getMessages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_chat: contact.id_chat })
            })
                .then(res => res.json())
                .then(data => setMessages(data))

                if (socket) {
                    socket.emit("joinRoom", {room: contact.id_chat})
                }
        } catch (error) {
            console.log(error)   
        }

    }


    function handleNewMessageChange(event) {
        setNewMessage(event.target.value);
    }

    function sendNewMessage(){
        try {
            if (newMessage.trim() === "" || !selectedContact) return;
            
            const now = new Date();
            // Formatear la fecha y hora manualmente
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, "0"); // Mes (0-indexado, por eso +1)
            const day = String(now.getDate()).padStart(2, "0");
            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            const seconds = String(now.getSeconds()).padStart(2, "0");
            
            const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
            const messageData = {
                id_usuario: sessionStorage.getItem("userId"),
                id_chat: selectedContact.id_chat,
                contenido: newMessage,
                hora: formattedDate
            };
    
            setNewMessage(""); // Limpiar el campo de entrada inmediatamente
    
            // Enviar el mensaje al servidor
            fetch("http://localhost:4006/sendMessage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(messageData)
            })
                .then(res => res.json())
                .then(data => {
                    console.log("Mensaje enviado:", data);
                })
            if (socket) {
                socket.emit("sendMessage", messageData);
            }
        } catch (error) {
            console.log(error)
        }
    }

    function newChat(){
        const userId = sessionStorage.getItem("userId")
        console.log(userId)
        try {
            // 1. compruebo que el mail sea valido
            if(!mailInput.trim()) {
                alert("Por favor, ingresa un mail")
                return
            }
            
            //2. Creo la constante de los datos del Nuevo Chat
            const datosNewChat = {
                mail: mailInput.trim(),
                nombre: "",
                id_usuarioAjeno: 0
            }

            console.log("Datos del nuevo Chat: ", datosNewChat)
    
            // 3. Realizo el fetch que busca al usuario con ese mail.
            fetch('http://localhost:4006/findUser', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({mail: datosNewChat.mail})
            })
            .then(res => res.json())
            .then(dataUser => {
                console.log("Datos del usuario: ", dataUser)
                if (dataUser.vector.length === 1) {
                    console.log("Se ha encontrado al usuario")
                    datosNewChat.nombre = dataUser.vector[0].nombre
                    datosNewChat.id_usuarioAjeno = dataUser.vector[0].id_usuario
                    console.log("COMPARO", dataUser.vector, contactos[0]) 
                    console.log(datosNewChat.id_usuarioAjeno, userId)
                    setContactos([...contactos, dataUser.vector[0]])
                    fetch('http://localhost:4006/newChat', {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({id_usuarioAjeno: datosNewChat.id_usuarioAjeno, id_usuarioPropio: userId, grupo: false})
                    })
                    .then(res => res.json())
                    .then(chat => {
                        console.log(chat)
                        closePopup()
                        
                    })
                }
            })
        } catch (error) {
            console.log(error)
        }
    }
    
   
    return (
        <div className={styles.screenDevice}>
            
            

            <Popup
                open={isPopupOpen}
                onClose={closePopup}
                modal
                nested
                closeOnDocumentClick={false}
                >
                    <div className={styles.modal}>
                        <div className={styles.header}>
                            <h2>Nuevo Chat</h2>
                        </div>
                        <div className={styles.content}>
                            <p>Ingresa el mail del usuario con quien quieres chatear</p>
                            <Input type="mail" placeholder="ejemplo@mail.com" value={mailInput} onChange={(e) =>setMailInput(e.target.value)} use="mailNewChat"/>
                        </div>
                        <div className={styles.actions}>
                            <button onClick={closePopup} className={styles.cancelBtn}>Cancelar</button>
                            <button onClick={newChat} className={styles.createBtn}>Crear chat</button>
                        </div>
                    </div>
            </Popup>
        </div>

        
    )
}