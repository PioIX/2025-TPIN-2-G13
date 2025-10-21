"use client";
import { useEffect, useRef } from "react";
import Phaser from "phaser";

export default function Game() {
  const gameContainer = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return; // Evita reiniciar el juego si ya existe

    const config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: {
        preload,
        create,
        update,
      },
      parent: gameContainer.current,
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // --- Ajusta tamaño si cambia la pantalla ---
    const handleResize = () => {
      game.scale.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  function preload() {
    this.load.image("background", "/backgrounds/estadio1.png");
  }

  function create() {
    // Fondo
    const bg = this.add.image(0, 0, "background").setOrigin(0, 0);
    bg.displayWidth = this.sys.game.config.width;
    bg.displayHeight = this.sys.game.config.height;

    // Jugadores (rectángulos azules)
    this.player1 = this.add.rectangle(200, 400, 50, 80, 0x0000ff);
    this.player2 = this.add.rectangle(1100, 400, 50, 80, 0x0000ff);

    // Pelota (círculo blanco)
    this.ball = this.add.circle(640, 360, 15, 0xffffff);

    // Físicas
    this.physics.add.existing(this.player1);
    this.physics.add.existing(this.player2);
    this.physics.add.existing(this.ball);

    this.ball.body.setCollideWorldBounds(true).setBounce(1);
  }

  
  function update() {
    // Por ahora sin movimiento
  }

  return <div ref={gameContainer} style={{ width: "100vw", height: "100vh" }} />;
}