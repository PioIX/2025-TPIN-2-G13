"use client";

import { useEffect, useState } from "react";
import Popup from "reactjs-popup";
import styles from "./home.module.css";
import Button from "@/components/Button";
import { useSocket } from "@/hooks/useSocket";
import Input from "@/components/Input";
import Lobby from "@/components/Lobby";
import { useRouter } from "next/navigation";
import { useConection } from "@/hooks/useConection";

export default function KabeGolHome() {
  const { url } = useConection();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [code, setCode] = useState("");

  const [jugadores, setJugadores] = useState([]);
  const [inLobby, setInLobby] = useState(false);
  const [roomCode, setRoomCode] = useState(null);
  
  useEffect(() => {
    if (!socket) return;

    socket.on("testResponse", (msg) => {
      alert("Respuesta de prueba: " + msg);
    });

    socket.on("updatePlayers", (jugadores) => {
      console.log("🔄 Actualización de jugadores recibida");
      console.log("👥 Jugadores actuales:", jugadores);
      setJugadores(jugadores);
    });

    socket.on("gameStart", (data) => {
      console.log("🚀 Recibido gameStart con code:", data.code);
      router.push(`/Kabegol/Game?code=${data.code}`);
    });

    return () => {
      socket.off("updatePlayers");
    };
  }, [socket]);

  function createRoom() {
    const id_user = sessionStorage.getItem("userId");
    socket.emit("createRoom", { id_user });

    socket.on("roomCreated", (data) => {
      console.log("✅ Sala creada con código:", data.code_room);
      setRoomCode(data.code_room);
      setInLobby(true);
    });

    socket.on("errorRoom", (msg) => {
      alert("Error: " + msg);
    }); 
    
  }

  function joinRoom() {
    const id_user = sessionStorage.getItem("userId");
    socket.emit("joinRoomByCode", { code_room: code, id_user });

    socket.off("joinedRoom"); // 💥 Limpia anteriores
    socket.off("errorRoom");


    socket.on("joinedRoom", (data) => {
      console.log("✅ Te uniste a la sala:", data.code_room);
      setRoomCode(data.code_room);
      setInLobby(true);
    });

    socket.on("errorRoom", (msg) => {
      alert("Error: " + msg);
    });
  }


  const [isSinglePopupOpen, setSinglePopupOpen] = useState(false);
  const [isMultiPopupOpen, setMultiPopupOpen] = useState(false);
  const [isRulesPopupOpen, setRulesPopupOpen] = useState(false);
  const [isCreateRoomOpen, setCreateRoomOpen] = useState(false);
  const [isJoinRoomOpen, setJoinRoomOpen] = useState(false);
  
  const [userLoggued, setUserLoggued] = useState([])

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch(url + "/findUserById", {
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

  function showCreateRoom() {
    setMultiPopupOpen(false);
    setCreateRoomOpen(true);
  }
  
  function showJoinRoom() {
    setMultiPopupOpen(false);
    setJoinRoomOpen(true);
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

  const joinRoomOpen = () => setJoinRoomOpen(true);
  const closeJoinRoom = () => setJoinRoomOpen(false);

  if (inLobby) {
    return (
      <>
      <Lobby
        code={roomCode}
        jugadores={jugadores}
        userId={sessionStorage.getItem("userId")}
      />
      <button onClick={() => socket.emit("test", { roomCode })}>Sala</button>
      </>
    ); 
  } else {
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
            <Button text="Crear una sala" onClick={showCreateRoom}></Button>
            <Button text="Unirse a una sala" onClick={showJoinRoom}></Button>
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
            <button onClick={createRoom} className={styles.confirmBtn}>
              Crear
            </button>
            <button onClick={closeCreateRoom} className={styles.cancelBtn}>
              Cancelar
            </button>
          </div>
        </div>
      </Popup>


      <Popup
        open={isJoinRoomOpen}
        onClose={closeJoinRoom}
        modal
        nested
        closeOnDocumentClick={false}
      >
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2>Unirse a una Sala</h2>
          </div>
          <div className={styles.content}>
            <p>Escribe el código de la sala</p>
          </div>
          <Input placeholder="ABC123..." type="text" onChange={(e) => {setCode(e.target.value)}}/>
          <div className={styles.actions}>
            <button onClick={joinRoom} className={styles.confirmBtn}>
              Crear
            </button>
            <button onClick={closeJoinRoom} className={styles.cancelBtn}>
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
}
