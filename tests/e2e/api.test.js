const request = require('supertest');
const app = require('../../server'); // Import the Express app
const Url = require('../../models/urlModel');
const mongoose = require('mongoose');

describe('API Endpoints - End-to-End Tests', () => {
    let server;

    beforeAll(async () => {
        // Start the server before running the tests
        server = app.listen(3001);

        // Connect to the test database
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterAll(async () => {
        // Close the server after running the tests
        await server.close();

        // Disconnect from the test database
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Clear the database before each test
        await Url.deleteMany({});
    });

    describe('POST /api/shorten', () => {
        it('should shorten a valid URL', async () => {
            const response = await request(server) // Use the server instance
                .post('/api/shorten')
                .send({ originalUrl: 'https://example.com' });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('shortUrl');
        });

        it('should return an error for an invalid URL', async () => {
            const response = await request(server) // Use the server instance
                .post('/api/shorten')
                .send({ originalUrl: 'invalid-url' });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Invalid URL' });
        });
    });

    describe('GET /:shortUrl', () => {
        it('should redirect to the original URL for a valid short URL', async () => {
            // Create a test URL in the database
            const url = new Url({
                originalUrl: 'https://example.com',
                shortUrl: 'abcd1234',
            });
            await url.save();

            console.log('Saved URL:', url); // Debug log

            const response = await request(server) // Use the server instance
                .get('/abcd1234');

            console.log('Response status:', response.status); // Debug log
            console.log('Response headers:', response.headers); // Debug log

            expect(response.status).toBe(302); // 302 is the status code for redirect
            expect(response.header.location).toBe('https://example.com');
        });

        it('should return an error for a non-existent short URL', async () => {
            const response = await request(server) // Use the server instance
                .get('/nonexistent');

            console.log('Response status:', response.status); // Debug log
            console.log('Response body:', response.body); // Debug log

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'URL not found' });
        });
    });
});