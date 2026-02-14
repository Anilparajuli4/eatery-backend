const http = require('http');

const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/products?page=1&limit=2',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('Response status:', res.statusCode);
        try {
            const json = JSON.parse(data);
            console.log('Meta:', json.meta);
            console.log('Items count:', json.items.length);
            console.log('First item:', json.items[0]?.name);
        } catch (e) {
            console.log('Error parsing JSON:', e.message);
            console.log('Raw data:', data.substring(0, 500));
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
