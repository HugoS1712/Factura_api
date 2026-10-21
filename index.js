require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const userController = require('./userController');

app.get('/', (req, res) => {
    res.send('API funcionando');
});

// Usuarios
app.get('/usuarios', userController.getUsuarios);

app.post('/usuarios', userController.addUsuario);

app.put('/usuarios/:id', userController.updateUsuario);

app.delete('/usuarios/:id', userController.deleteUsuario);

// Activación de cuenta
app.post('/activar-cuenta', userController.activarCuenta);

app.post('/validar-google', userController.validarGoogle);

app.listen(port, () => {
    console.log(`API escuchando en puerto ${port}`);
});