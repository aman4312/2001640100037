

const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send(`Server is working`);
})

app.get('/numbers', async (req, res) => {
    let urls = req.query?.url;
    if (!Array.isArray(urls)) urls = [urls];
    const result = new Set(); // Use a Set to store unique values

    try {
        await Promise.all(urls.map(async url => {
            try {
                const r = await axios.get(url);
                if (r.status === 200 && r.data?.numbers) {
                    r.data.numbers.forEach(number => {
                        result.add(number); 
                    });
                } else {
                    console.log(`Invalid response from ${url}:`, r.status);
                }
            } catch (err) {
                console.error(`Error fetching from ${url}:`, err.message);
                if (err.response && err.response.status === 404) {
                    console.log(`Resource not found at ${url}`);
                    
                }
            }
        }));

        
        const sortedResult = [...result].sort((a, b) => a - b);

        if (sortedResult.length === 0) {
            res.status(404).json({
                message: 'No numbers found in the provided URLs',
            });
        } else {
            res.status(200).json({
                message: 'Success',
                result: sortedResult
            });
        }
    } catch (error) {
        console.error('Internal Server Error:', error);
        res.status(500).json({
            message: 'Internal server error',
        });
    }
});
app.listen(port, () => {
    console.log(`Listening on ${port}`);
});
