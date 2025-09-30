import express, { Express } from "express";
import { db } from "./lib/connectionDB";
import userRoutes from "./routes/user.routes";
import eventRoutes from "./routes/event.routes";
import betRoutes from "./routes/bet.routes";

const app: Express = express();

const port: number = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bets', betRoutes);


// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Sports Betting API is running',
        timestamp: new Date().toISOString()
    });
});

// Routes for testing models (Only in development)
if (process.env.NODE_ENV !== 'production') {
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
}

db.then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        console.log(`Sports Betting API started`);
    });
});
