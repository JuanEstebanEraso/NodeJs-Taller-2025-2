import express, { Express } from "express";
import { db } from "./lib/connectionDB";
import userRoutes from "./routes/userRoutes";
import eventRoutes from "./routes/eventRoutes";
import betRoutes from "./routes/betRoutes";

const app: Express = express();

const port: number = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bets', betRoutes);


// Routes for testing models (Testing only)
app.get('/test-models', async (req, res) => {
    try {
        const { UserModel } = await import('./models/User');
        const { EventModel } = await import('./models/Event');
        const { BetModel } = await import('./models/Bet');
        
        res.json({
            message: 'Models loaded successfully',
            models: ['User', 'Event', 'Bet']
        });
    } catch (error) {
        res.status(500).json({ error: 'Error loading models', details: error });
    }
});

// Route to create DB and collections (testing only)
app.get('/create-db', async (req, res) => {
    try {
        const { UserModel } = await import('./models/User');
    
        const adminUser = await UserModel.create({
            username: 'admin',
            password: '123456',
            balance: 0,
            role: 'admin'
        });
        
        res.json({
            message: 'Database and collections created!',
            admin: adminUser
        });
    } catch (error) {
        res.status(500).json({ error: 'Error creating DB', details: error });
    }
});

db.then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        console.log(`Sports Betting API started`);
    });
});
