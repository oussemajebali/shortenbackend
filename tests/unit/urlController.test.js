const { shortenUrl, redirectUrl } = require('../../controllers/urlController');
const Url = require('../../models/urlModel');
const validator = require('validator');
const crypto = require('crypto');

// Mock the Url model
jest.mock('../../models/urlModel');

describe('URL Controller - Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear all mocks before each test
    });

    describe('shortenUrl', () => {
        it('should return a shortened URL for a valid input', async () => {
            const req = {
                body: {
                    originalUrl: 'https://example.com',
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(), // Mock status to return `this`
                json: jest.fn(), // Mock json function
            };

            // Mock the save function to resolve with a saved URL object
            Url.prototype.save.mockResolvedValueOnce({
                originalUrl: 'https://example.com',
                shortUrl: 'abcd1234',
            });

            // Mock the crypto.randomBytes function to return a fixed value
            jest.spyOn(crypto, 'randomBytes').mockReturnValueOnce(Buffer.from('abcd1234', 'hex'));

            await shortenUrl(req, res);

            // Verify that res.status was called with 200
            expect(res.status).toHaveBeenCalledWith(200);

            // Verify that res.json was called with the correct shortUrl
            expect(res.json).toHaveBeenCalledWith({ shortUrl: 'abcd1234' });
        });

        it('should return an error for an invalid URL', async () => {
            const req = {
                body: {
                    originalUrl: 'invalid-url',
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            await shortenUrl(req, res);

            // Verify that res.status was called with 400
            expect(res.status).toHaveBeenCalledWith(400);

            // Verify that res.json was called with the correct error message
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid URL' });
        });
    });

    describe('redirectUrl', () => {
        it('should redirect to the original URL for a valid short URL', async () => {
            const req = {
                params: {
                    shortUrl: 'abcd1234',
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                redirect: jest.fn(),
            };

            // Mock the findOne function to resolve with a URL object
            Url.findOne.mockResolvedValueOnce({
                originalUrl: 'https://example.com',
            });

            await redirectUrl(req, res);

            // Verify that res.redirect was called with the correct URL
            expect(res.redirect).toHaveBeenCalledWith('https://example.com');
        });

        it('should return an error for a non-existent short URL', async () => {
            const req = {
                params: {
                    shortUrl: 'nonexistent',
                },
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };

            // Mock the findOne function to resolve with null
            Url.findOne.mockResolvedValueOnce(null);

            await redirectUrl(req, res);

            // Verify that res.status was called with 404
            expect(res.status).toHaveBeenCalledWith(404);

            // Verify that res.json was called with the correct error message
            expect(res.json).toHaveBeenCalledWith({ error: 'URL not found' });
        });
    });
});