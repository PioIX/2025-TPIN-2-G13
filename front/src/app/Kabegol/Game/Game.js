"use client";
import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { useRouter } from "next/navigation";

export default function Game({ socket, code_room, playerNumber, userId }) {
  const gameContainer = useRef(null);
  const gameRef = useRef(null);
  const socketRef = useRef(socket);
  const playerNumberRef = useRef(playerNumber);
  const router = useRouter();

  useEffect(() => {
    socketRef.current = socket;
    playerNumberRef.current = playerNumber;
  }, [socket, playerNumber]);

  useEffect(() => {
    if (gameRef.current) return;
    if (!gameContainer.current) return;

    // Variables globales para la escena
    let player1, player2, ball;
    let boot1, boot2; // 🦵 Botines
    let cursors, keys;
    let score1 = 0, score2 = 0;
    let scoreText, timerText, countdownText;
    let ground;
    let goalLeft, goalRight;
    let lastBallUpdate = 0;
    const BALL_UPDATE_RATE = 50;
    
    // ⏱️ Variables del timer
    let gameTime = 60;
    let gameStarted = false;
    let gameOver = false;
    let countdown = 3;
    let timerEvent;

    const config = {
      type: Phaser.AUTO,
      width: 1280,
      height: 720,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 600 },
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

    // Crear textura de botín
    function createBoot(scene, color) {
      const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
      
      // Forma de botín simplificada
      graphics.fillStyle(color, 1);
      
      // Suela
      graphics.fillRect(0, 20, 25, 8);
      
      // Parte superior del botín
      graphics.beginPath();
      graphics.moveTo(5, 20);
      graphics.lineTo(5, 8);
      graphics.lineTo(20, 5);
      graphics.lineTo(25, 10);
      graphics.lineTo(25, 20);
      graphics.closePath();
      graphics.fillPath();
      
      // Cordones (blanco)
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRect(8, 10, 2, 8);
      graphics.fillRect(12, 10, 2, 8);
      graphics.fillRect(16, 10, 2, 8);
      
      const key = color === 0xff0000 ? 'boot_red' : 'boot_blue';
      graphics.generateTexture(key, 25, 28);
      graphics.destroy();
    }

    function createSoccerBall(scene) {
      const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
      const radius = 15;
      
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(radius, radius, radius);
      
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
      
      graphics.lineStyle(1, 0xcccccc, 0.5);
      graphics.strokeCircle(radius, radius, radius);
      
      graphics.generateTexture('soccerball', radius * 2, radius * 2);
      graphics.destroy();
    }

    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function create() {
      const scene = this;

      // Fondo
      const bg = scene.add.image(640, 360, "background");
      bg.setDisplaySize(1280, 720);

      createSoccerBall(scene);
      createBoot(scene, 0xff0000); // Botín rojo
      createBoot(scene, 0x0000ff); // Botín azul

      // Suelo
      ground = scene.add.rectangle(640, 643, 1280, 10, 0x000000, 0);
      scene.physics.add.existing(ground, true);
      const groundLine = scene.add.rectangle(640, 643, 1280, 3, 0xffffff);

      // Arcos
      const arcoLeftImage = scene.add.image(25, 550, "arco");
      arcoLeftImage.setDisplaySize(80, 200);
      arcoLeftImage.setDepth(0);

      const arcoRightImage = scene.add.image(1255, 550, "arco");
      arcoRightImage.setDisplaySize(80, 200);
      arcoRightImage.setFlipX(true);
      arcoRightImage.setDepth(0);

      goalLeft = scene.add.rectangle(20, 590, 40, 160, 0xff0000, 0);
      goalRight = scene.add.rectangle(1260, 590, 40, 160, 0x0000ff, 0);
      scene.physics.add.existing(goalLeft, true);
      scene.physics.add.existing(goalRight, true);

      // 🦵 Jugador 1 + Botín (SIEMPRE VISIBLE)
      player1 = scene.add.circle(200, 500, 30, 0xff0000);
      player1.setDepth(1);
      scene.physics.add.existing(player1);
      player1.body.setCollideWorldBounds(true);
      player1.body.setBounce(0.3);
      player1.body.setCircle(30);
      player1.body.setMass(1.2);

      boot1 = scene.add.sprite(200, 525, 'boot_red');
      boot1.setDepth(2); // ✅ Por encima de todo
      boot1.setOrigin(0.5, 0.2);
      boot1.setVisible(true);
      scene.physics.add.existing(boot1);

      boot1.body.setAllowGravity(false);
      boot1.body.setSize(30, 20);
      boot1.body.setOffset(-2, 8);
      boot1.isKicking = false;
      boot1.kickCooldown = 0;

      // 🦵 Jugador 2 + Botín (SIEMPRE VISIBLE)
      player2 = scene.add.circle(1080, 500, 30, 0x0000ff);
      player2.setDepth(1);
      scene.physics.add.existing(player2);
      player2.body.setCollideWorldBounds(true);
      player2.body.setBounce(0.3);
      player2.body.setCircle(30);
      player2.body.setMass(1.2);

      boot2 = scene.add.sprite(1080, 525, 'boot_blue');
      boot2.setDepth(2); // ✅ Por encima de todo
      boot2.setOrigin(0.5, 0.2);
      boot2.setVisible(true);
      boot2.setFlipX(true);
      scene.physics.add.existing(boot2);

      boot2.body.setAllowGravity(false);
      boot2.body.setSize(30, 20);
      boot2.body.setOffset(-2, 8);
      boot2.isKicking = false;
      boot2.kickCooldown = 0;

      // Pelota
      ball = scene.add.sprite(640, 300, 'soccerball');
      ball.setDepth(1);
      scene.physics.add.existing(ball);
      ball.body.setCollideWorldBounds(true);
      ball.body.setBounce(0.7);
      ball.body.setCircle(15);
      ball.body.setMass(0.4);
      ball.body.setDrag(50, 0);

      // Colisiones
      scene.physics.add.collider(player1, ground);
      scene.physics.add.collider(player2, ground);
      scene.physics.add.collider(ball, ground, ballGroundCollision);
      scene.physics.add.collider(player1, player2);
      
      // 🦵 Colisión botines con pelota
      scene.physics.add.overlap(boot1, ball, (boot, ball) => kickBall(boot, ball, player1));
      scene.physics.add.overlap(boot2, ball, (boot, ball) => kickBall(boot, ball, player2));

      scene.physics.add.overlap(ball, goalLeft, () => goalScored(2), null, scene);
      scene.physics.add.overlap(ball, goalRight, () => goalScored(1), null, scene);

      // UI
      scoreText = scene.add.text(640, 30, "0 - 0", {
        fontSize: "48px",
        fill: "#ffffff",
        fontFamily: "Arial",
        stroke: "#000000",
        strokeThickness: 4,
      }).setOrigin(0.5).setDepth(10);

      timerText = scene.add.text(640, 90, formatTime(gameTime), {
        fontSize: "36px",
        fill: "#ffff00",
        fontFamily: "Arial",
        stroke: "#000000",
        strokeThickness: 3,
      }).setOrigin(0.5).setDepth(10);

      countdownText = scene.add.text(640, 360, countdown.toString(), {
        fontSize: "120px",
        fill: "#ffffff",
        fontFamily: "Arial",
        stroke: "#000000",
        strokeThickness: 8,
      }).setOrigin(0.5).setDepth(20);

      // Controles
      cursors = scene.input.keyboard.createCursorKeys();
      keys = scene.input.keyboard.addKeys({
        w: Phaser.Input.Keyboard.KeyCodes.W,
        a: Phaser.Input.Keyboard.KeyCodes.A,
        d: Phaser.Input.Keyboard.KeyCodes.D,
      });

      if (playerNumberRef.current === 1) {
        scene.time.addEvent({
          delay: 1000,
          repeat: 2,
          callback: () => {
            countdown--;
            if (countdown > 0) {
              socketRef.current.emit("updateCountdown", { code_room, countdown });
            } else {
              socketRef.current.emit("startGameTimer", { code_room });
            }
          }
        });
      }

      // Socket listeners
      if (socketRef.current) {
        socketRef.current.on("updateCountdown", (data) => {
          countdown = data.countdown;
          countdownText.setText(countdown.toString());
        });

        socketRef.current.on("startGameTimer", () => {
          countdownText.setText("GO!");
          scene.time.delayedCall(500, () => {
            countdownText.destroy();
            gameStarted = true;
            startTimer();
          });
        });

        socketRef.current.on("timerUpdate", (data) => {
          gameTime = data.time;
          timerText.setText(formatTime(gameTime));
        });

        socketRef.current.on("gameEnded", (data) => {
          endGame(data.score1, data.score2);
        });

        socketRef.current.on("opponentMove", (data) => {
          const opponent = playerNumberRef.current === 1 ? player2 : player1;
          const opponentBoot = playerNumberRef.current === 1 ? boot2 : boot1;
          
          if (opponent && opponent.body && !gameOver) {
            opponent.x = data.x;
            opponent.y = data.y;
            opponent.body.setVelocity(data.vx, data.vy);
            
            // 🦵 Sincronizar botín (siempre visible y por encima)
            opponentBoot.x = data.bootX;
            opponentBoot.y = data.bootY;
            opponentBoot.rotation = data.bootRotation;
            opponentBoot.setDepth(2); // Asegurar que se vea
          }
        });

        socketRef.current.on("ballSync", (data) => {
          if (ball && ball.body && !gameOver) {
            ball.x = data.x;
            ball.y = data.y;
            ball.body.setVelocity(data.vx, data.vy);
          }
        });

        socketRef.current.on("goalScored", (data) => {
          score1 = data.score1;
          score2 = data.score2;
          updateScoreText();
          if (!gameOver) resetPositions();
        });

        socketRef.current.on("kickEffect", (data) => {
          createKickEffect(scene, data.x, data.y);
          
          // Animar el botín del otro jugador
          if (data.playerNum !== playerNumberRef.current) {
            const opponentBoot = data.playerNum === 1 ? boot1 : boot2;
            const kickDirection = opponentBoot.flipX ? 1 : -1;
            
            scene.tweens.add({
              targets: opponentBoot,
              rotation: kickDirection * 1.2,
              duration: 80,
              yoyo: true,
              ease: 'Power2'
            });
          }
        });
      }

      function ballGroundCollision(ball, ground) {
        if (ball.body.touching.down) {
          ball.body.velocity.x *= 0.85;
          
          if (Math.abs(ball.body.velocity.x) < 10) {
            ball.body.velocity.x = 0;
          }
        }
      }

      // 🦵 Sistema de patada mejorado con ANIMACIÓN
      function kickBall(boot, ball, player) {
        if (!gameStarted || gameOver) return;
        if (boot.isKicking || boot.kickCooldown > 0) return;
        
        // 🎬 Iniciar animación de patada
        boot.isKicking = true;
        boot.kickCooldown = 15; // frames de cooldown
        
        // Calcular dirección del golpe
        const angle = Phaser.Math.Angle.Between(boot.x, boot.y, ball.x, ball.y);
        
        // 🔥 Calcular fuerza basada en velocidad del jugador
        const playerSpeed = Math.sqrt(
          player.body.velocity.x ** 2 + 
          player.body.velocity.y ** 2
        );
        
        // Fuerza base + bonus por velocidad
        const baseForce = 400;
        const speedBonus = playerSpeed * 1.2;
        const totalForce = baseForce + speedBonus;
        
        // 🎯 Dirección del golpe
        let kickAngle = angle;
        
        // Ajustar ángulo según movimiento vertical
        if (player.body.velocity.y > 100) {
          kickAngle += 0.3;
        } else if (player.body.velocity.y < -100) {
          kickAngle -= 0.5;
        }
        
        // 💥 Aplicar velocidad a la pelota
        const kickVelocityX = Math.cos(kickAngle) * totalForce;
        const kickVelocityY = Math.sin(kickAngle) * totalForce;
        
        ball.body.setVelocity(kickVelocityX, kickVelocityY);
        
        // 🎬 Animación del botín (rotación tipo Soccer Heads)
        const isFlipped = boot.flipX;
        const kickDirection = isFlipped ? 1 : -1;
        
        scene.tweens.add({
          targets: boot,
          rotation: kickDirection * 1.2, // Rotación de patada
          duration: 80,
          yoyo: true,
          ease: 'Power2',
          onComplete: () => {
            boot.isKicking = false;
          }
        });
        
        // Efecto visual
        createKickEffect(scene, ball.x, ball.y);
        
        // Emitir al otro jugador
        if (socketRef.current) {
          socketRef.current.emit("kickEffect", {
            code_room,
            x: ball.x,
            y: ball.y,
            playerNum: playerNumberRef.current
          });
        }
        
        console.log(`⚽ Patada! Fuerza: ${Math.round(totalForce)}`);
      }

      function createKickEffect(scene, x, y) {
        // Partículas de impacto
        const particles = scene.add.particles(x, y, 'soccerball', {
          speed: { min: 50, max: 150 },
          scale: { start: 0.3, end: 0 },
          lifespan: 300,
          quantity: 8,
          blendMode: 'ADD'
        });
        
        scene.time.delayedCall(300, () => particles.destroy());
      }

      function startTimer() {
        if (playerNumberRef.current === 1) {
          timerEvent = scene.time.addEvent({
            delay: 1000,
            repeat: gameTime - 1,
            callback: () => {
              gameTime--;
              socketRef.current.emit("timerTick", { code_room, time: gameTime });
              
              if (gameTime <= 0) {
                socketRef.current.emit("endGame", { code_room, score1, score2 });
              }
            }
          });
        }
      }

      function endGame(finalScore1, finalScore2) {
        gameOver = true;
        gameStarted = false;

        player1.body.setVelocity(0, 0);
        player2.body.setVelocity(0, 0);
        ball.body.setVelocity(0, 0);
        boot1.rotation = 0;
        boot2.rotation = 0;

        const overlay = scene.add.rectangle(640, 360, 1280, 720, 0x000000, 0.8);
        overlay.setDepth(50);

        const titleText = scene.add.text(640, 200, "GAME OVER", {
          fontSize: "72px",
          fill: "#ffff00",
          fontFamily: "Arial",
          stroke: "#000000",
          strokeThickness: 6,
        }).setOrigin(0.5).setDepth(51);

        const finalScoreText = scene.add.text(640, 300, `${finalScore1} - ${finalScore2}`, {
          fontSize: "64px",
          fill: "#ffffff",
          fontFamily: "Arial",
          stroke: "#000000",
          strokeThickness: 5,
        }).setOrigin(0.5).setDepth(51);

        let winnerMsg = "EMPATE!";
        let winnerColor = "#ffffff";
        if (finalScore1 > finalScore2) {
          winnerMsg = "¡ROJO GANA!";
          winnerColor = "#ff0000";
        } else if (finalScore2 > finalScore1) {
          winnerMsg = "¡AZUL GANA!";
          winnerColor = "#0000ff";
        }

        const winnerText = scene.add.text(640, 400, winnerMsg, {
          fontSize: "56px",
          fill: winnerColor,
          fontFamily: "Arial",
          stroke: "#000000",
          strokeThickness: 5,
        }).setOrigin(0.5).setDepth(51);

        const buttonBg = scene.add.rectangle(640, 520, 300, 70, 0x4CAF50);
        buttonBg.setDepth(51);
        buttonBg.setInteractive({ useHandCursor: true });

        const buttonText = scene.add.text(640, 520, "Volver al Lobby", {
          fontSize: "32px",
          fill: "#ffffff",
          fontFamily: "Arial",
        }).setOrigin(0.5).setDepth(52);

        buttonBg.on('pointerover', () => {
          buttonBg.setFillStyle(0x66BB6A);
        });

        buttonBg.on('pointerout', () => {
          buttonBg.setFillStyle(0x4CAF50);
        });

        buttonBg.on('pointerdown', () => {
          if (socketRef.current) {
            socketRef.current.emit("leaveGame", { code_room });
          }
          window.location.href = "/Kabegol/Home";
        });
      }

      function goalScored(scoringPlayer) {
        if (!gameStarted || gameOver) return;
        
        if (socketRef.current && playerNumberRef.current === 1) {
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
        boot1.rotation = 0;
        boot2.rotation = 0;
      }
    }

    function update(time) {
      const scene = this;

      if (!gameStarted || gameOver) return;

      // Rotar pelota
      if (ball && ball.body) {
        const velocityMagnitude = Math.sqrt(
          ball.body.velocity.x ** 2 + ball.body.velocity.y ** 2
        );
        if (velocityMagnitude > 10) {
          ball.angle += velocityMagnitude * 0.03;
        }
      }

      // Movimiento
      const myPlayer = playerNumberRef.current === 1 ? player1 : player2;
      const myBoot = playerNumberRef.current === 1 ? boot1 : boot2;
      const useWASD = playerNumberRef.current === 1;

      if (myPlayer && myPlayer.body) {
        const speed = 250;
        const jumpPower = -450;
        let isMoving = false;

        if (useWASD) {
          if (keys.a.isDown) {
            myPlayer.body.setVelocityX(-speed);
            isMoving = true;
          } else if (keys.d.isDown) {
            myPlayer.body.setVelocityX(speed);
            isMoving = true;
          } else {
            myPlayer.body.setVelocityX(0);
          }

          if (keys.w.isDown && myPlayer.body.touching.down) {
            myPlayer.body.setVelocityY(jumpPower);
          }
        } else {
          if (cursors.left.isDown) {
            myPlayer.body.setVelocityX(-speed);
            isMoving = true;
          } else if (cursors.right.isDown) {
            myPlayer.body.setVelocityX(speed);
            isMoving = true;
          } else {
            myPlayer.body.setVelocityX(0);
          }

          if (cursors.up.isDown && myPlayer.body.touching.down) {
            myPlayer.body.setVelocityY(jumpPower);
          }
        }

        // 🦵 Botín SIEMPRE cerca del jugador (casi pegado)
        myBoot.x = myPlayer.x;
        myBoot.y = myPlayer.y + 26; // Solo 26px debajo (casi pegado al círculo)
        
        // Cooldown del botín
        if (myBoot.kickCooldown > 0) {
          myBoot.kickCooldown--;
        }
        
        // Voltear botín según dirección
        if (myPlayer.body.velocity.x > 10) {
          myBoot.setFlipX(false);
        } else if (myPlayer.body.velocity.x < -10) {
          myBoot.setFlipX(true);
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
            bootX: myBoot.x,
            bootY: myBoot.y,
            bootRotation: myBoot.rotation,
          });
        }
      }

      // Actualizar pelota (solo host)
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
        socketRef.current.off("updateCountdown");
        socketRef.current.off("startGameTimer");
        socketRef.current.off("timerUpdate");
        socketRef.current.off("gameEnded");
        socketRef.current.off("kickEffect");
      }
      game.destroy(true);
      gameRef.current = null;
    };
  }, [code_room, playerNumber]);

  return <div ref={gameContainer} style={{ width: "100%", height: "100%" }} />;
}