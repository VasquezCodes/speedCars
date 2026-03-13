const admin = require('firebase-admin');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)$/);
    if (match) {
        let value = match[2].trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        env[match[1]] = value;
    }
});

console.log('Available keys:', Object.keys(env));
console.log('FIREBASE_ADMIN_PROJECT_ID:', env.FIREBASE_ADMIN_PROJECT_ID);
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: env.FIREBASE_ADMIN_PROJECT_ID || env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: (env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
});

admin.auth().listUsers(1)
    .then(list => {
        console.log('AUTH_STATUS: ENABLED');
        console.log('Users found:', list.users.length);
        process.exit(0);
    })
    .catch(error => {
        console.log('AUTH_STATUS: ERROR');
        console.log('Error Code:', error.code);
        console.log('Error Message:', error.message);
        process.exit(1);
    });
