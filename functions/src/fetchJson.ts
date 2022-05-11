import * as https from 'https';

export async function fetchJson<T>(hostname: string, path: string, accessToken: string, method = 'GET') {
    return new Promise<T>((resolve, reject) => {
        let data = '';
        https.get({
            hostname,
            path,
            port: 443,
            method,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        }, (res) => {
            res.on('data', chunk => data += chunk);
            res.on('end', () => { 
                resolve(JSON.parse(data)) 
            });
        }).on('error', reject);
    });
}