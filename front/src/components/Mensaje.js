import styles from "@/components/Mensajes.module.css"
import clsx from "clsx"

export default function Mensaje({ contenido, hora, esEnviado }) {
    return (
        <div 
            className={clsx(styles.message, {
                    [styles.messageSent] : esEnviado === true,
                    [styles.messageReceived] : esEnviado === false,
                })}>
                <p>{contenido}</p>
        <span className={styles.hour}>
            {new Date(hora).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} 
        </span>
    </div>
    )
}

// aclarar fechas en la date pq devuelve mal al pasasr 24 hraas
// <div className={`message ${esEnviado ? "sent" : "received"}`}>