import { useEffect, useState } from "react";
import Imagen from "@/components/Imagen"
import styles from "./Contacto.module.css"
import { Socket } from "socket.io-client";
import { useSocket } from "@/hooks/useSocket";

export default function Contacto({ onSelectContact = () => {} , contactos, selectedContact}) {
    // const [contactos, setContactos] = useState([]);
    
    

    function handleClick(contacto) {
        console.log("Contacto clickeado:", contacto)
        onSelectContact(contacto) 
    }


    return (
        <div className={styles.contactList}>
            {contactos.length != 0 && contactos.map((contacto) => (
                    
                    <div 
                        key={contacto.id_chat - 1} 
                        className={`${styles.contactItem} ${selectedContact?.id_chat === contacto.id_chat ? styles.selected : ""}`} 
                        onClick={() => handleClick(contacto)}>

                        


                            <Imagen 
                                src={contacto.grupo == false ? contacto.foto_perfil: contacto.foto}
                                alt={"Foto de: " + (contacto.grupo ? contacto.nom_grupo : contacto.nombre)}
                                where="perfil"
                            />  
                            <span className={styles.contactName}>
                                {contacto.grupo ? contacto.nom_grupo : contacto.nombre}
                            </span>
                    </div>
                
            ))}
        </div>
    )
} 