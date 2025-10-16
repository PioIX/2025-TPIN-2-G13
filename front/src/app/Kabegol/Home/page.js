"use client";

import { useEffect, useState } from "react";
import Popup from "reactjs-popup";
import styles from "./Home.module.css";

export default function KabeGolHome() {
  const [isSinglePopupOpen, setSinglePopupOpen] = useState(false);
  const [isMultiPopupOpen, setMultiPopupOpen] = useState(false);
  const [isRulesPopupOpen, setRulesPopupOpen] = useState(false);
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
    })
  }, [])


  // --- POPUP handlers ---
  const openSinglePopup = () => setSinglePopupOpen(true);
  const closeSinglePopup = () => setSinglePopupOpen(false);

  const openMultiPopup = () => setMultiPopupOpen(true);
  const closeMultiPopup = () => setMultiPopupOpen(false);

  const openRulesPopup = () => setRulesPopupOpen(true);
  const closeRulesPopup = () => setRulesPopupOpen(false);

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
                {[
                  { name: "Nastasi", img: "/c1.jpg" },
                  { name: "Putrino", img: "/c2.jpg" },
                  { name: "Manzanares", img: "/c3.jpg" },
                ].map((c, i) => (
                  <div key={i} className={styles.contactItem}>
                    <img
                      src={c.img}
                      alt={c.name}
                      className={styles.contactPic}
                    />
                    <span>{c.name}</span>
                  </div>
                ))}
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
            <h2>Modo Multijugador</h2>
          </div>
          <div className={styles.content}>
            <p>Acá podrías crear o unirte a una sala multijugador.</p>
          </div>
          <div className={styles.actions}>
            <button onClick={closeMultiPopup} className={styles.cancelBtn}>
              Cerrar
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
            <p>1. Gana el que meta más goles.</p>
            <p>2. No se permiten manos 😅</p>
            <p>3. Disfrutá y reíte, que es Kabegol!</p>
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
