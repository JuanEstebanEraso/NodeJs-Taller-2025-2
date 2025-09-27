import express, { Express } from "express";
import { db } from "./lib/connectionDB";

const app: Express = express();

const port: number = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// Rutas temporal para probar los modelos (Solo para probar)
app.get('/test-models', async (req, res) => {
    try {
        const { UserModel } = await import('./models/User');
        const { EventModel } = await import('./models/Event');
        const { BetModel } = await import('./models/Bet');
        
        res.json({
            message: 'Modelos cargados correctamente',
            models: ['User', 'Event', 'Bet']
        });
    } catch (error) {
        res.status(500).json({ error: 'Error cargando modelos', details: error });
    }
});

// Ruta para crear la BD y colecciones (solo para probar)
app.get('/create-db', async (req, res) => {
    try {
        const { UserModel } = await import('./models/User');
    
        const adminUser = await UserModel.create({
            username: 'admin',
            password: '123456',
            saldo: 0,
            role: 'admin'
        });
        
        res.json({
            message: 'Base de datos y colecciones creadas!',
            admin: adminUser
        });
    } catch (error) {
        res.status(500).json({ error: 'Error creando BD', details: error });
    }
});

db.then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        console.log(`API de Apuestas Deportivas iniciada`);
    });
});
