const http = require('http');
const sizes = require('../../../config/sizes');
const sizes_arr = Object.values(sizes);
const email = "abc@gmail.com";
const password = "Pass55";

const make_request = (path, method, content,  token) => {
    return new Promise((resolve, reject) => {
        const headers = { 'Content-Type': 'application/json' };
        if (content)
        {
            content = JSON.stringify(content);
            headers['Content-Length'] = content.length;
        }
        if (token)
            headers.Authorization = `Bearer ${token}`;
        const options = {
            hostname: '127.0.0.1',
            port: 4800,
            path,
            method,
            headers
        };
        const req = http.request(options, async res => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                console.log(chunk);
                resolve(chunk);
            });
        });
        req.on('error', (err) => { console.log(err); reject(err) });
        req.write(content);
        req.end();
    });
}

const login = async () => {
    try
    {
        const res = await make_request('/api/auth/login', 'POST', {email, password});
        addItems(res.token);
    }
    catch(err)
    {
        console.log(err);
    }
}

const addItems = async (token) => {
    try
    {
        const args = process.argv.slice(1);
        await Promise.all(args.map(id => {
            make_request('/api/cart/add', 'POST', {
                productId: id,
                size: sizes_arr[Math.floor(Math.random() * sizes_arr.length)],
                quantity: Math.floor(Math.random() * 5) + 1
            }, token);
        }));
        checkout(token);
    }
    catch(err)
    {
        console.log(err);
    }
}

const checkout = async (token) => {
    try
    {
        await make_request('/api/cart/checkout', 'POST', token);
    }
    catch(err)
    {
        console.log(err);
    }
}

login();