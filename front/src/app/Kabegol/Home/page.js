"use client";

import { useEffect, useState } from "react";
import Popup from "reactjs-popup";
import styles from "./home.module.css";
import Button from "@/components/Button";

export default function KabeGolHome() {
  const [isSinglePopupOpen, setSinglePopupOpen] = useState(false);
  const [isMultiPopupOpen, setMultiPopupOpen] = useState(false);
  const [isRulesPopupOpen, setRulesPopupOpen] = useState(false);
  const [isCreateRoomOpen, setCreateRoomOpen] = useState(false);
  
  const [userLoggued, setUserLoggued] = useState([])

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("http://localhost:4006/findUserById", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id_user: sessionStorage.getItem("userId")
        })
    })
    .then(response => response.json())
    .then(result => {
        setUserLoggued(result)
        console.log(result)
    })
  }, [])

  function CreateRoom() {
    setMultiPopupOpen(false);
    setCreateRoomOpen(true);

  }



  // --- POPUP handlers ---
  const openSinglePopup = () => setSinglePopupOpen(true);
  const closeSinglePopup = () => setSinglePopupOpen(false);

  const openMultiPopup = () => setMultiPopupOpen(true);
  const closeMultiPopup = () => setMultiPopupOpen(false);

  const openRulesPopup = () => setRulesPopupOpen(true);
  const closeRulesPopup = () => setRulesPopupOpen(false);

  const createRoomOpen = () => setCreateRoomOpen(true);
  const closeCreateRoom = () => setCreateRoomOpen(false);


  return (
    <div className={styles.container}>
      {/* Fondo cancha animada */}
      <div className={styles.background}></div>

      {/* Título principal */}
      <h1 className={styles.title}>KABEGOL</h1>

      {/* Botones principales */}
      <div className={styles.buttonsContainer}>
        <button className={styles.btnSingle} onClick={openSinglePopup}>
          Un jugador
        </button>
        <button className={styles.btnMulti} onClick={openMultiPopup}>
          Multijugador
        </button>
        <button className={styles.btnRules} onClick={openRulesPopup}>
          Reglas
        </button>
      </div>

      {/* Barra lateral */}
      <div
        className={`${styles.sidebar} ${
          sidebarOpen ? styles.sidebarOpen : ""
        }`}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <div className={styles.sidebarContent}>
          <img
            src="/profile.jpg"
            alt="Perfil"
            className={styles.profilePic}
          />
          {sidebarOpen && (
            <div className={styles.sidebarExpanded}>
              <p className={styles.username}>Facu</p>
              <hr className={styles.divider} />
              <div className={styles.contacts}>
                
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- POPUPS --- */}

      {/* Popup Un Jugador */}
      <Popup
        open={isSinglePopupOpen}
        onClose={closeSinglePopup}
        modal
        nested
        closeOnDocumentClick={false}
      >
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2>Modo Un Jugador</h2>
          </div>
          <div className={styles.content}>
            <p>Acá podrías configurar el modo un jugador o iniciar el juego.</p>
          </div>
          <div className={styles.actions}>
            <button onClick={closeSinglePopup} className={styles.cancelBtn}>
              Cerrar
            </button>
          </div>
        </div>
      </Popup>

      {/* Popup Multijugador */}
      <Popup
        open={isMultiPopupOpen}
        onClose={closeMultiPopup}
        modal
        nested
        closeOnDocumentClick={false}
      >
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2>Multijugador</h2>
          </div>
          <div className={styles.content}>
            <Button text="Crear una sala" onClick={CreateRoom}></Button>
            <Button text="Unirse a una sala"></Button>
          </div>
          <div className={styles.actions}>
            <button onClick={closeMultiPopup} className={styles.cancelBtn}>
              Cerrar
            </button>
          </div>
        </div>
      </Popup>

      <Popup
        open={isCreateRoomOpen}
        onClose={closeCreateRoom}
        modal
        nested
        closeOnDocumentClick={false}
      >
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2>Crear una Sala</h2>
          </div>
          <div className={styles.content}>
            <p>Aquí puedes configurar y crear una nueva sala de juego.</p>
          </div>
          <div className={styles.actions}>
            <button onClick={CreateRoom} className={styles.confirmBtn}>
              Crear
            </button>
            <button onClick={closeCreateRoom} className={styles.cancelBtn}>
              Cancelar
            </button>
          </div>
        </div>
      </Popup>


      {/* Popup Reglas */}
      <Popup
        open={isRulesPopupOpen}
        onClose={closeRulesPopup}
        modal
        nested
        closeOnDocumentClick={false}
      >
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2>Reglas del Juego</h2>
          </div>
          <div className={styles.content}>
            
          </div>
          <div className={styles.actions}>
            <button onClick={closeRulesPopup} className={styles.cancelBtn}>
              Cerrar
            </button>
          </div>
        </div>
      </Popup>
    </div>
  );
}
