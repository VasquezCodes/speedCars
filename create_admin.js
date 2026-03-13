const admin = require('firebase-admin');
const fs = require('fs');

// Better .env.local parser
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
const lines = envContent.split(/\r?\n/);
let currentKey = null;
let currentValue = "";
let inQuotes = false;

for (let line of lines) {
    if (!currentKey) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)$/);
        if (match) {
            currentKey = match[1];
            currentValue = match[2].trim();
            if (currentValue.startsWith('"')) {
                inQuotes = true;
                currentValue = currentValue.slice(1);
            }
            if (inQuotes && currentValue.endsWith('"')) {
                inQuotes = false;
                currentValue = currentValue.slice(0, -1);
                env[currentKey] = currentValue;
                currentKey = null;
            } else if (!inQuotes) {
                env[currentKey] = currentValue;
                currentKey = null;
            }
        }
    } else {
        currentValue += '\n' + line;
        if (currentValue.endsWith('"')) {
            inQuotes = false;
            currentValue = currentValue.slice(0, -1);
            env[currentKey] = currentValue;
            currentKey = null;
        }
    }
}

const projectId = env.FIREBASE_ADMIN_PROJECT_ID || env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = env.FIREBASE_ADMIN_CLIENT_EMAIL;
let privateKey = env.FIREBASE_ADMIN_PRIVATE_KEY;

console.log('Project ID:', projectId);
console.log('Client Email:', clientEmail);
console.log('Private Key Start:', privateKey ? privateKey.substring(0, 30) : 'MISSING');

if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
}

if (!projectId || !clientEmail || !privateKey) {
    console.error('Missing Firebase Admin credentials in .env.local');
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
    }),
});

const email = 'admin@speedcars.com';
const password = 'admin123';

admin.auth().createUser({
    email,
    password,
    emailVerified: true,
})
.then((userRecord) => {
    console.log('Successfully created new user:', userRecord.email);
    console.log('Password set to:', password);
    process.exit(0);
})
.catch((error) => {
    if (error.code === 'auth/email-already-exists') {
        console.log('User already exists:', email);
        process.exit(0);
    }
    console.error('Error creating new user:', error);
    process.exit(1);
});
