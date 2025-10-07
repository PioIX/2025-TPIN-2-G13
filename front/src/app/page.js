"use client"

import Button from "@/components/Button";
import { useRouter } from "next/navigation";
import styles from "./page.module.css"




export default function Home() {

  const router = useRouter()

  function login() {
    router.replace("/login")
  }


  return (
    <div className={styles.homecontainer}>
      <nav className={styles.header}>
        <p className={styles.headerhomep}>2025 PROYECTO CHAT GRUPO 13 - INTEGRANTES: FACUNDO SUAREZ, JUAN IGNACIO NASTASI, AGUSTIN PUTRINO, FRANCISCO MANZANARES</p>
      </nav>
      <h1 className={styles.titlehome}>Chatsites</h1>
      <h2 className={styles.subtitlehome}>Tu mejor lugar para comunicarte</h2>
      <div className={styles.entrarhome}>
        <p className={styles.phome}>Empieza a chatear ya</p>
        <Button text="ChatSites" onClick={login} page="home"></Button>
      </div>
      <p className={styles.footerhome}>Muchas gracias por visitar este sitio</p>
    </div>
  );
}
