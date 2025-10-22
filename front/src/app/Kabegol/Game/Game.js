"use client";
import { useEffect, useRef } from "react";
import Phaser from "phaser";

export default function Game({ socket, code_room, playerNumber, userId }) {
  const gameContainer = useRef(null);
  const gameRef = useRef(null);
  const socketRef = useRef(socket);
  const playerNumberRef = useRef(playerNumber);

  useEffect(() => {
    socketRef.current = socket;
    playerNumberRef.current = playerNumber;
  }, [socket, playerNumber]);

  useEffect(() => {
    if (gameRef.current) return;
    if (!gameContainer.current) return;

    // Variables globales para la escena
    let player1, player2, ball;
    let cursors, keys;
    let score1 = 0, score2 = 0;
    let scoreText;
    let ground;
    let goalLeft, goalRight;
    let lastBallUpdate = 0;
    const BALL_UPDATE_RATE = 50; // ms entre actualizaciones de pelota

    const config = {
      type: Phaser.AUTO,
      width: 1280,
      height: 720,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 800 },
          debug: false,
        },
      },
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
      parent: gameContainer.current,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    function preload() {
      this.load.image("background", "/backgrounds/estadio1.png");
    }

    function create() {
      const scene = this;

      // Fondo
      const bg = scene.add.image(640, 360, "background");
      bg.setDisplaySize(1280, 720);


      

      // Suelo invisible (para colisiones) - Moverlo más arriba
      ground = scene.add.rectangle(640, 643, 1280, 10, 0x000000, 0);
      scene.physics.add.existing(ground, true); // Static body

      // Línea visual del suelo
      const groundLine = scene.add.rectangle(640, 643, 1280, 3, 0xffffff);

      // Arcos
      goalLeft = scene.add.rectangle(40, 543, 80, 160, 0xff0000, 0.3);
      goalRight = scene.add.rectangle(1240, 600, 80, 160, 0x0000ff, 0.3);
      scene.physics.add.existing(goalLeft, true);
      scene.physics.add.existing(goalRight, true);

      // Postes visuales
      scene.add.rectangle(10, 520, 8, 160, 0xffffff);
      scene.add.rectangle(70, 520, 8, 160, 0xffffff);
      scene.add.rectangle(70, 440, 60, 8, 0xffffff);

      scene.add.rectangle(1270, 520, 8, 160, 0xffffff);
      scene.add.rectangle(1210, 520, 8, 160, 0xffffff);
      scene.add.rectangle(1210, 440, 60, 8, 0xffffff);

      // Jugador 1 (Izquierda - Rojo)
      player1 = scene.add.circle(200, 500, 30, 0xff0000);
      scene.physics.add.existing(player1);
      player1.body.setCollideWorldBounds(true);
      player1.body.setBounce(0.2);
      player1.body.setCircle(30);

      // Jugador 2 (Derecha - Azul)
      player2 = scene.add.circle(1080, 500, 30, 0x0000ff);
      scene.physics.add.existing(player2);
      player2.body.setCollideWorldBounds(true);
      player2.body.setBounce(0.2);
      player2.body.setCircle(30);

      // Pelota
      ball = scene.add.circle(640, 300, 15, 0xffffff);
      scene.physics.add.existing(ball);
      ball.body.setCollideWorldBounds(true);
      ball.body.setBounce(0.8);
      ball.body.setCircle(15);

      // Colisiones
      scene.physics.add.collider(player1, ground);
      scene.physics.add.collider(player2, ground);
      scene.physics.add.collider(ball, ground);
      scene.physics.add.collider(player1, player2);
      scene.physics.add.collider(player1, ball, handleBallHit);
      scene.physics.add.collider(player2, ball, handleBallHit);

      // Detección de goles
      scene.physics.add.overlap(ball, goalLeft, () => goalScored(2), null, scene);
      scene.physics.add.overlap(ball, goalRight, () => goalScored(1), null, scene);

      // Marcador
      scoreText = scene.add.text(640, 30, "0 - 0", {
        fontSize: "48px",
        fill: "#ffffff",
        fontFamily: "Arial",
        stroke: "#000000",
        strokeThickness: 4,
      }).setOrigin(0.5);

      // Controles
      cursors = scene.input.keyboard.createCursorKeys();
      keys = scene.input.keyboard.addKeys({
        w: Phaser.Input.Keyboard.KeyCodes.W,
        a: Phaser.Input.Keyboard.KeyCodes.A,
        d: Phaser.Input.Keyboard.KeyCodes.D,
      });

      // Socket listeners
      if (socketRef.current) {
        socketRef.current.on("opponentMove", (data) => {
          const opponent = playerNumberRef.current === 1 ? player2 : player1;
          if (opponent && opponent.body) {
            opponent.x = data.x;
            opponent.y = data.y;
            opponent.body.setVelocity(data.vx, data.vy);
          }
        });

        socketRef.current.on("ballSync", (data) => {
          if (ball && ball.body) {
            ball.x = data.x;
            ball.y = data.y;
            ball.body.setVelocity(data.vx, data.vy);
          }
        });

        socketRef.current.on("goalScored", (data) => {
          score1 = data.score1;
          score2 = data.score2;
          updateScoreText();
          resetPositions();
        });
      }

      function handleBallHit(player, ball) {
        // Aplicar fuerza adicional al golpear
        const angle = Phaser.Math.Angle.Between(player.x, player.y, ball.x, ball.y);
        const force = 300;
        ball.body.setVelocity(
          Math.cos(angle) * force,
          Math.sin(angle) * force - 100 // Impulso hacia arriba
        );
      }

      function goalScored(scoringPlayer) {
        if (socketRef.current && playerNumberRef.current === 1) {
          // Solo el host actualiza los goles
          if (scoringPlayer === 1) score1++;
          else score2++;

          socketRef.current.emit("goal", {
            code_room,
            score1,
            score2,
          });

          updateScoreText();
          resetPositions();
        }
      }

      function updateScoreText() {
        scoreText.setText(`${score1} - ${score2}`);
      }

      function resetPositions() {
        player1.setPosition(200, 500);
        player1.body.setVelocity(0, 0);
        player2.setPosition(1080, 500);
        player2.body.setVelocity(0, 0);
        ball.setPosition(640, 300);
        ball.body.setVelocity(0, 0);
      }
    }

    function update(time) {
      const scene = this;

      // Movimiento del jugador controlado
      const myPlayer = playerNumberRef.current === 1 ? player1 : player2;
      const useWASD = playerNumberRef.current === 1;

      if (myPlayer && myPlayer.body) {
        const speed = 200;
        const jumpPower = -400;

        // Movimiento horizontal
        if (useWASD) {
          if (keys.a.isDown) {
            myPlayer.body.setVelocityX(-speed);
          } else if (keys.d.isDown) {
            myPlayer.body.setVelocityX(speed);
          } else {
            myPlayer.body.setVelocityX(0);
          }

          // Salto
          if (keys.w.isDown && myPlayer.body.touching.down) {
            myPlayer.body.setVelocityY(jumpPower);
          }
        } else {
          if (cursors.left.isDown) {
            myPlayer.body.setVelocityX(-speed);
          } else if (cursors.right.isDown) {
            myPlayer.body.setVelocityX(speed);
          } else {
            myPlayer.body.setVelocityX(0);
          }

          // Salto
          if (cursors.up.isDown && myPlayer.body.touching.down) {
            myPlayer.body.setVelocityY(jumpPower);
          }
        }

        // Emitir posición al servidor
        if (socketRef.current) {
          socketRef.current.emit("playerMove", {
            code_room,
            playerNumber: playerNumberRef.current,
            x: myPlayer.x,
            y: myPlayer.y,
            vx: myPlayer.body.velocity.x,
            vy: myPlayer.body.velocity.y,
          });
        }
      }

      // Solo el host actualiza la pelota
      if (ball && ball.body && playerNumberRef.current === 1) {
        if (time - lastBallUpdate > BALL_UPDATE_RATE) {
          lastBallUpdate = time;
          
          if (socketRef.current) {
            socketRef.current.emit("ballUpdate", {
              code_room,
              x: ball.x,
              y: ball.y,
              vx: ball.body.velocity.x,
              vy: ball.body.velocity.y,
            });
          }
        }
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("opponentMove");
        socketRef.current.off("ballSync");
        socketRef.current.off("goalScored");
      }
      game.destroy(true);
      gameRef.current = null;
    };
  }, [code_room, playerNumber]);

  return <div ref={gameContainer} style={{ width: "100%", height: "100%" }} />;
}