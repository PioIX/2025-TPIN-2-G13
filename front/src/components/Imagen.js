import styles from "@/components/Contacto.module.css"
import clsx from "clsx"


export default function Imagen(props){
    return(
        <img 
            src={props.src} 
            alt={props.alt} 
            className={clsx(styles.Imagen, {
                [styles.contactImg]: props.where === "perfil"
            })}
        />
    )
}