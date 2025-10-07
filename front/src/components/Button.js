import styles from "@/components/Button.module.css"
import clsx from "clsx";


export default function Button(props) {
    return (
        <>
            <button className={
                clsx(
                    {
                        [styles.buttonhome] : props.page == "home",
                        [styles.buttonLogin] : props.page === "login",
                        [styles.buttonRegister] : props.page === "register",
                        [styles.buttonNuevoChat] : props.use === "nuevoChat",
                        [styles.buttonMandarMensaje] : props.use === "mandarMensaje"
                    }
                )
            } onClick={props.onClick}>{props.text}</button>
        </>
    );
}
