"use client";
import Button from "./Button";
import styles from "./lobby.module.css";
import { useSocket } from "@/hooks/useSocket";

export default function Lobby({ code, jugadores, userId }) {

  const {socket, isConnected} = useSocket();
  

  console.log("Jugadores en Lobby:", jugadores);
  
  console.log("Mi userId:", userId); 
  const soyHost = jugadores.some(
  (jug) => Number(jug.id_user) === Number(userId) && Number(jug.esHost) === 1
  );

  console.log("¿Soy host?", soyHost);

  function onStartGame() {
    console.log("🚀 Iniciando juego...");
    socket.emit("startGame", {code});
  }

  return (
    <div className={styles.lobbyContainer}>
      {/* Caja elegante con el código */}
      <div className={styles.roomCodeBox}>
        Código de sala: <span>{code}</span>
      </div>

      <div className={styles.players}>
        {jugadores.map((jug) => (
          <div key={jug.id_user} className={styles.playerCard}>
            <img src={jug.image || "/profile.jpg"} alt={jug.username} />
            <h3 className={styles.playerName}>{jug.username}</h3>

            {/* Si es el host */}
            {Boolean(jug.esHost) && <p className={styles.hostTag}>Host</p>}

            {/* Si el jugador actual está listo */}
            {jug.id_user === userId && (
              <p className={styles.ready}>✅ Listo</p>
            )}
          </div>
        ))}

        {/* Si hay menos de 2 jugadores */}
        {jugadores.length < 2 && (
          <div className={styles.emptySlot}>Esperando jugador...</div>
        )}
        </div>

        {/* 🔥 Botón visible solo para el host cuando hay 2 jugadores */}
        {soyHost && jugadores.length === 2 && (
          <Button page="lobby" onClick={onStartGame} text="Iniciar Juego"/>
      )}
    </div>
  );
}