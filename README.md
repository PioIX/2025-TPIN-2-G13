KABEGOL
Football Pio Heads

Integrantes:
Facundo Suarez
Agustin Putrino
Francisco Manzanares
Juan Ignacio Nastasi

La aplicación propuesta consiste en un videojuego multijugador en línea inspirado en el estilo Football Heads. El objetivo principal es ofrecer a los usuarios una experiencia divertida y competitiva, donde cada jugador controle un personaje en un campo de fútbol simplificado, con la posibilidad de moverlo, golpear la pelota y marcar goles en la portería rival.
El acceso a la aplicación se realizará a través de un sistema de registro y login que permitirá a los usuarios crear su perfil, guardar datos personales y seleccionar avatares personalizados para sus partidas. Una vez dentro, podrán crear o unirse a una sala de juego (room), la cual será gestionada mediante sockets para garantizar la comunicación en tiempo real entre los jugadores.
Durante la partida, el sistema llevará el control del tiempo de juego, el marcador y los goles realizados. Al finalizar el encuentro, se registrará el resultado y se determinará el ganador. La aplicación también incorporará un sistema de chat en línea, con posibilidad de expandirse a chat de voz utilizando tecnologías de comunicación en tiempo real (WebRTC), fomentando así la interacción entre los jugadores.5
A futuro, se prevé la implementación de un modo con inteligencia artificial, en el que el usuario podrá jugar contra un bot controlado por la computadora. Este bot será programado para reaccionar a la posición de la pelota y al movimiento del rival, brindando un desafío adicional a los jugadores que deseen practicar sin necesidad de otro oponente humano.
En resumen, la aplicación busca integrar diversión, interacción social y competencia, ofreciendo tanto partidas entre amigos mediante códigos de acceso a salas privadas, como la posibilidad de enfrentarse a un bot controlado por inteligencia artificial.

Tabla Base de datos:

<img width="620" height="223" alt="image" src="https://github.com/user-attachments/assets/e4868039-96a6-453a-96e7-d05a2cb3b086" />


Objetivos:

El desarrollo del proyecto se dividirá en tres grandes etapas para facilitar el control del progreso. En una primera instancia, con una duración estimada de dos semanas, se implementará la base del sistema con el registro y login de usuarios, la carga de sus datos en la base de datos y la posibilidad de crear o unirse a salas de juego mediante códigos generados con Socket.IO. En la segunda etapa, prevista hasta la semana cinco, se avanzará en la programación del juego en tiempo real, desarrollando la cancha, los jugadores, la pelota, la detección de colisiones y goles, el cronómetro y el marcador, de manera que dos usuarios puedan jugar una partida completa y registrar su resultado. Finalmente, en la tercera etapa, con fecha tentativa hasta la semana ocho, se incorporarán las funcionalidades avanzadas, como el chat dentro de las salas (texto y voz), la implementación de un bot con inteligencia artificial básica que permita jugar contra la máquina y diversas mejoras visuales como animaciones y avatares personalizados. De esta forma, se establecen objetivos parciales claros que permiten ir midiendo el avance del grupo en cada fase del trabajo.

Divisiones:

La división de responsabilidades dentro del grupo será la siguiente: Suarez se encargará principalmente del desarrollo del frontend, trabajando con React en la interfaz de usuario y en la integración del motor de juego. Nastasi asumirá la responsabilidad del backend, creando la API con Node.js, gestionando la comunicación con la base de datos y la autenticación de usuarios. Manzanares estará a cargo de la gestión de la base de datos, diseñando las tablas, relaciones y consultas necesarias, así como la integración del sistema de carga de imágenes mediante Multer. Finalmente, Putrino se ocupará de la implementación de la comunicación en tiempo real con Socket.IO, tanto para la sincronización del juego multijugador como para el desarrollo del chat en línea.
