var express = require('express'); //Tipo de servidor: Express
var bodyParser = require('body-parser'); //Convierte los JSON

var cors = require('cors');
const session = require("express-session")
const { realizarQuery } = require('./modulos/mysql');
const { Socket } = require('socket.io');


var app = express(); //Inicializo express
var port = process.env.PORT || 4006; //Ejecuto el servidor en el puerto 300// Convierte una petición recibida (POST-GET...) a objeto JSON

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors())


const server = app.listen(port, () => {
    console.log(`Servidor corriendo encç http://localhost:${port}/`)
})

const io = require("socket.io")(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    },
});

const sessionMiddleware = session({
    secret: "pototo",
    resave: false,
    saveUninitialized: false,
});

app.use(sessionMiddleware)
io.use((Socket, next) => {
    sessionMiddleware(Socket.request, {}, next)
})








app.get('/', function (req, res) {
    res.status(200).send({
        message: 'GET Home route working fine!'
    });
});






app.get('/usuarios', async function (req, res) {
    try {
        const respuesta = await realizarQuery(`
            SELECT * FROM UsuariosChat
        `)
        res.send(respuesta)
    } catch (error) {
        console.log(error)
    }
})

app.post('/register', async function (req, res) {
    console.log(req.body)
    try {
        if (req.body.foto_perfil == null) {
            req.body.foto_perfil = null
        } else {
            req.body.foto_perfil = `'${req.body.foto_perfil}'`
        }
        const respuesta = await realizarQuery(`
            INSERT INTO UsuariosChat (nombre, apellido, mail, contraseña, desc_personal, foto_perfil, en_linea)    
            VALUES ('${req.body.nombre}', '${req.body.apellido}', '${req.body.mail}', '${req.body.contraseña}', '${req.body.desc_personal}', ${req.body.foto_perfil}, ${req.body.en_linea})
        `)
        res.send({res: true, message: "Usuario Creado Correctamente"})
    } catch (error) {
        console.log(error)
    }
})

app.post('/findUser', async function (req, res) {
    try {
        const respuesta = await realizarQuery(`
            SELECT * FROM UsuariosChat WHERE mail = '${req.body.mail}'
        `)
        if (respuesta.length > 0)
            res.send({ vector: respuesta, existe: true })
        else
            res.send({ vector: respuesta, existe: false })
    } catch (error) {
        console.log(error)
    }
})

app.post('/findUserId', async function (req, res) {
    try {
        const respuesta = await realizarQuery(`
            SELECT id_usuario FROM UsuariosChat WHERE mail = '${req.body.mail}'
        `)
        res.send(respuesta)
    } catch (error) {
        console.log(error)
    }
})

app.put('/putOnline', async function (req, res) {
    try {
        const respuesta = await realizarQuery(`
            UPDATE UsuariosChat
            SET en_linea = ${req.body.en_linea}
            WHERE id_usuario = ${req.body.id_usuario}
        `)
        res.send(respuesta)
    } catch (error) {
        console.log(error)
    }
})

app.post('/bringContacts', async function (req, res) {
    try {

        const respuesta = await realizarQuery(`
            Select Chats.foto, nom_grupo, grupo, UsuariosChat.foto_perfil, UsuariosPorChats.id_chat, UsuariosChat.nombre
            FROM Chats
            INNER JOIN UsuariosPorChats ON Chats.id_chat = UsuariosPorChats.id_chat
            INNER JOIN UsuariosChat ON UsuariosPorChats.id_usuario = UsuariosChat.id_usuario
            WHERE UsuariosPorChats.id_chat IN (
                SELECT id_chat FROM UsuariosPorChats WHERE id_usuario = ${req.body.id_usuario}
            ) AND UsuariosChat.id_usuario != ${req.body.id_usuario};
        `)

        for (let i=0; i<respuesta.length; i++) {
            if (respuesta[i].foto_perfil == null || respuesta[i].foto_perfil == "") {
                respuesta[i].foto_perfil = "https://cdn-icons-png.flaticon.com/512/847/847969.png"
            }
            if (respuesta[i].foto == null || respuesta[i].foto == "") {
                respuesta[i].foto = "https://cdn-icons-png.flaticon.com/512/847/847969.png"
            }
        }

        

        res.send(respuesta)
    } catch (error) {
        console.log(error)
    }
})


app.post('/getMessages', async function (req, res) {
    try {
        const respuesta = await realizarQuery(`
            SELECT id_mensajes, id_usuario, contenido, hora
            FROM Mensajes
            WHERE id_chat = ${req.body.id_chat}
            ORDER BY hora ASC
        `)
        res.send(respuesta)
    } catch (error) {
        console.log(error)
        res.status(500).send("Error al traer mensajes")
    }
})

app.post('/sendMessage', async function (req, res) {
    try {
        const respuesta = await realizarQuery(`
            INSERT INTO Mensajes (id_usuario, id_chat, contenido, hora)
            VALUES (${req.body.id_usuario}, ${req.body.id_chat}, '${req.body.contenido}', '${req.body.hora}')
        `)
        res.send(respuesta)
    } catch (error) {
        console.log(error)
        res.status(500).send("Error al enviar mensaje")
    }
})


app.post('/newChat', async function (req, res) {

    try {


        // 1. Buscar si existe un chat con esa persona
        const existingChat = await realizarQuery(`
            SELECT uc1.id_chat
            FROM UsuariosPorChats uc1
            INNER JOIN UsuariosPorChats uc2 ON uc1.id_chat = uc2.id_chat
            WHERE uc1.id_usuario = ${req.body.id_usuarioPropio} AND uc2.id_usuario = ${req.body.id_usuarioAjeno};    
        `)

        // 2. Verificar si existe
        if (existingChat.length === 1) {
            return res.send({ ok: false, mensaje: "Ya existe un chat entre ustedes", id_chat: existingChat[0].id_chat })
        }


        //3. Crear el chat
        const crearChat = await realizarQuery(`
            INSERT INTO Chats (grupo, nom_grupo, descripcion, foto)   
            VALUES (${req.body.grupo}, "", "", "")
        `);

        //4. Buscar nuevo ChatID
        const NuevoChatId = crearChat.insertId // insertId es un mensaje que devuelve predeterminadamente al realizar una sentencia "INSERT INTO"


        await realizarQuery(`
            INSERT INTO UsuariosPorChats (id_chat, id_usuario)
            VALUES (${NuevoChatId}, ${req.body.id_usuarioPropio})        
        `);

        await realizarQuery(`
            INSERT INTO UsuariosPorChats (id_chat, id_usuario)
            VALUES (${NuevoChatId}, ${req.body.id_usuarioAjeno})        
        `);

        res.send({ ok: true, mensaje: "Se ha podido crear el chat y su relacion con éxito.", id_chat: NuevoChatId })
    } catch (error) {
        console.log(error)
        res.status(500).send({ ok: false, mensaje: "Error al crear el chat" })
    }
})






io.on("connection", (socket) => {
    const req = socket.request;
    socket.on("joinRoom", (data) => {
        console.log("🚀 ~ io.on ~ req.session.room:", req.session.room);
        if (req.session.room != undefined && req.session.room.length > 0)
            socket.leave(req.session.room);
            req.session.room = data.room;
            socket.join(req.session.room);
            io.to(req.session.room).emit("chat-messages", {
                user: req.session.user,
                room: req.session.room,
        });
    });
    socket.on("pingAll", (data) => {
        console.log("PING ALL: ", data);
        io.emit("pingAll", { event: "Ping to all", message: data });
    });
    socket.on("sendMessage", (data) => {
        io.to(req.session.room).emit("newMessage", {
            room: req.session.room,
            message: data,
        });
    });
    socket.on("disconnect", () => {
        console.log("Disconnect");
    });
});



