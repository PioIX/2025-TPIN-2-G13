"use client";
import styles from "./lobby.module.css";

export default function Lobby({ code, jugadores, userId }) {
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
            {jug.esHost && <p className={styles.hostTag}>Host</p>}

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
    </div>
  );
}