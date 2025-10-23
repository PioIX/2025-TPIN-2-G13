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
      this.load.image("arco", "/backgrounds/arcoNormal.png");
    }

    // Función para crear la textura de la pelota
    function createSoccerBall(scene) {
      const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
      const radius = 15;
      
      // Fondo blanco de la pelota
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(radius, radius, radius);
      
      // Pentágono central negro
      graphics.fillStyle(0x000000, 1);
      graphics.beginPath();
      const pentagonRadius = radius * 0.35;
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
        const x = radius + Math.cos(angle) * pentagonRadius;
        const y = radius + Math.sin(angle) * pentagonRadius;
        if (i === 0) {
          graphics.moveTo(x, y);
        } else {
          graphics.lineTo(x, y);
        }
      }
      graphics.closePath();
      graphics.fillPath();
      
      // Pentágonos alrededor (simplificados)
      const positions = [
        { angle: 0, distance: 0.7 },
        { angle: 72, distance: 0.7 },
        { angle: 144, distance: 0.7 },
        { angle: 216, distance: 0.7 },
        { angle: 288, distance: 0.7 },
      ];
      
      positions.forEach(pos => {
        const angleRad = (pos.angle * Math.PI) / 180;
        const centerX = radius + Math.cos(angleRad) * radius * pos.distance;
        const centerY = radius + Math.sin(angleRad) * radius * pos.distance;
        const smallRadius = radius * 0.25;
        
        graphics.fillStyle(0x000000, 1);
        graphics.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI / 5) - Math.PI / 2 + angleRad;
          const x = centerX + Math.cos(angle) * smallRadius;
          const y = centerY + Math.sin(angle) * smallRadius;
          if (i === 0) {
            graphics.moveTo(x, y);
          } else {
            graphics.lineTo(x, y);
          }
        }
        graphics.closePath();
        graphics.fillPath();
      });
      
      // Borde para darle profundidad
      graphics.lineStyle(1, 0xcccccc, 0.5);
      graphics.strokeCircle(radius, radius, radius);
      
      graphics.generateTexture('soccerball', radius * 2, radius * 2);
      graphics.destroy();
    }

    function create() {
      const scene = this;

      // Fondo
      const bg = scene.add.image(640, 360, "background");
      bg.setDisplaySize(1280, 720);

      createSoccerBall(scene);

      // Suelo invisible (para colisiones)
      ground = scene.add.rectangle(640, 643, 1280, 10, 0x000000, 0);
      scene.physics.add.existing(ground, true);

      // Línea visual del suelo
      const groundLine = scene.add.rectangle(640, 643, 1280, 3, 0xffffff);

      
  
      // Arco izquierdo (normal)
      const arcoLeftImage = scene.add.image(25, 550, "arco");
      arcoLeftImage.setDisplaySize(80, 200); // Ajustar tamaño según necesites
      arcoLeftImage.setDepth(0); // Atrás de todo
  
      // Arco derecho (invertido horizontalmente)
      const arcoRightImage = scene.add.image(1255, 550, "arco");
      arcoRightImage.setDisplaySize(80, 200);
      arcoRightImage.setFlipX(true); // 🔥 ESTO LO INVIERTE
      arcoRightImage.setDepth(0);

      // Áreas de gol (invisibles para colisiones)
      // scene.add.rectangle(x, y, w, h, color, bright)
      goalLeft = scene.add.rectangle(20, 560, 80, 160, 0xff0000, 0); // 🔥 Alpha 0 = invisible
      goalRight = scene.add.rectangle(1260, 560, 80, 160, 0x0000ff, 0);
      scene.physics.add.existing(goalLeft, true);
      scene.physics.add.existing(goalRight, true);

      // Jugador 1 (Izquierda - Rojo)
      player1 = scene.add.circle(200, 500, 30, 0xff0000);
      player1.setDepth(1); // 🔥 Adelante del arco
      scene.physics.add.existing(player1);
      player1.body.setCollideWorldBounds(true);
      player1.body.setBounce(0.2);
      player1.body.setCircle(30);

      // Jugador 2 (Derecha - Azul)
      player2 = scene.add.circle(1080, 500, 30, 0x0000ff);
      player2.setDepth(1); // 🔥 Adelante del arco
      scene.physics.add.existing(player2);
      player2.body.setCollideWorldBounds(true);
      player2.body.setBounce(0.2);
      player2.body.setCircle(30);

      // Pelota
      ball = scene.add.sprite(640, 300, 'soccerball'); // 🔥 Cambiar a sprite con textura
      ball.setDepth(1); // 🔥 Adelante del arco
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

      // Rotar la pelota según su velocidad
      if (ball && ball.body) {
        const velocityMagnitude = Math.sqrt(
          ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
        );
        ball.angle += velocityMagnitude * 0.05;
      }

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