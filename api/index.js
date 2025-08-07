const express = require('express');
const { spawn } = require('child_process');
const crypto = require('crypto');
require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = process.env.API_PORT || 3000;
const SCRIPTS_PATH = process.env.SCRIPTS_PATH || './'; 

// Configure nodemailer transporter 
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

function sendInProgressEmail(to, siteUrl) {
    return transporter.sendMail({
        from: process.env.FROM_EMAIL.includes('<')
            ? process.env.FROM_EMAIL
            : `"O8 Site Creation" <${process.env.FROM_EMAIL}>`,
        to,
        subject: 'Your site creation is in progress',
        text: `Your request to create a new WordPress site at ${siteUrl} is in progress. You will receive another email once the process is complete.`
    });
}

function sendFailureEmail(to, siteUrl, error) {
    return transporter.sendMail({
        from: process.env.FROM_EMAIL.includes('<')
            ? process.env.FROM_EMAIL
            : `"O8 Site Creation" <${process.env.FROM_EMAIL}>`,
        to,
        subject: 'Site creation failed',
        text: `Unfortunately, your site at ${siteUrl} could not be created. Error: ${error}`
    });
}

function sendSuccessEmail(to, siteUrl, adminUsername) {
    const resetLink = `${siteUrl}/wp-login.php?action=lostpassword`;
    return transporter.sendMail({
        from: process.env.FROM_EMAIL.includes('<')
            ? process.env.FROM_EMAIL
            : `"O8 Site Creation" <${process.env.FROM_EMAIL}>`,
        to,
        subject: 'Your WordPress site is ready!',
        text: `Your new WordPress site is ready!

Site URL: ${siteUrl}
Admin Username: ${adminUsername}

To set up your password, please visit:
${resetLink}

This link will allow you to securely set your own password.`
    });
}

function sendUserPasswordResetEmail(to, siteUrl, username) {
    const resetLink = `${siteUrl}/wp-login.php?action=lostpassword`;
    return transporter.sendMail({
        from: process.env.FROM_EMAIL.includes('<')
            ? process.env.FROM_EMAIL
            : `"O8 Site Creation" <${process.env.FROM_EMAIL}>`,
        to,
        subject: 'Set up your WordPress account',
        text: `An account has been created for you on ${siteUrl}

Username: ${username}

To set up your password, please visit:
${resetLink}

This link will allow you to securely set your own password.`
    });
}

// --- Helper Function to Run Scripts ---
// This function runs a script and returns a promise, making it easy to use with async/await.
const runScript = (scriptName, args) => {
    return new Promise((resolve, reject) => {
        const scriptPath = `${SCRIPTS_PATH}/${scriptName}`;
        console.log(`\n▶️  Executing: sudo ${scriptPath} ${args.join(' ')}`);

        const child = spawn('sudo', ['bash', scriptPath, ...args]);

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
            process.stdout.write(data.toString()); // Stream stdout in real-time
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            process.stderr.write(data.toString()); // Stream stderr in real-time
            stderr += data.toString();
        });

        child.on('close', (code) => {
            if (code !== 0) {
                console.error(`❌ Script ${scriptName} exited with code ${code}`);
                return reject(new Error(`Script ${scriptName} failed. Check logs for details.`));
            }
            console.log(`✅ Script ${scriptName} finished successfully.`);
            resolve(stdout);
        });

        child.on('error', (err) => {
            console.error(`Failed to start script ${scriptName}: ${err.message}`);
            reject(new Error(`Failed to start script ${scriptName}.`));
        });
    });
};

// --- Middleware for API Key Authentication ---
const apiKeyAuth = (req, res, next) => {
    const providedKey = req.headers['x-api-key'];
    if (!providedKey || providedKey !== process.env.API_SECRET_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    }
    next();
};

// --- API Endpoint ---
app.post('/site-creation/v1/wordpress', apiKeyAuth, (req, res) => {
    // 1. Validate incoming payload
    const { subdomain, siteTitle, adminUsername, adminEmail, users } = req.body;
    if (!subdomain || !siteTitle || !adminUsername || !adminEmail) {
        return res.status(400).json({ 
            error: 'Missing required fields. Required: subdomain, siteTitle, adminUsername, adminEmail' 
        });
    }
    // Basic sanitization
    if (!/^[a-z0-9-]+$/.test(subdomain)) {
        return res.status(400).json({ error: 'Invalid subdomain format. Use lowercase letters, numbers, and hyphens only.' });
    }
    if (users && !Array.isArray(users)) {
        return res.status(400).json({ error: 'users must be an array' });
    }
    console.log(`\n\n🚀 Received new site creation request for subdomain: ${subdomain}`);

    const siteUrl = `https://${subdomain}.${process.env.DOMAIN_NAME}`;
    const siteDir = `/var/www/html/${subdomain}.${process.env.DOMAIN_NAME}`;
    if (fs.existsSync(siteDir)) {
        return res.status(409).json({
            error: 'A site with this subdomain already exists.'
        });
    }
    // Respond immediately
    res.status(202).json({
        message: 'Site creation request received. The process will continue in the background.',
        siteUrl,
        adminUsername: adminUsername
    });

    // Send in-progress email
    //sendInProgressEmail(adminEmail, siteUrl).catch(console.error);

    // Run the site creation process asynchronously
    (async () => {
        try {
            await runScript('create_wordpress_site.sh', [subdomain]);
            await runScript('install_wordpress.sh', [subdomain, siteTitle, adminUsername, adminEmail]);
            
            // Prepare user arguments
            let userArgs = [];
            if (users && users.length > 0) {
                users.forEach(u => {
                    userArgs.push(u.username, u.email, u.role, u.password || '');
                    // Send password reset email to each user
                    sendUserPasswordResetEmail(u.email, siteUrl, u.username).catch(console.error);
                });
            }
            
            await runScript('configure_wordpress.sh', [subdomain, siteTitle, ...userArgs]);
            
            sendSuccessEmail(adminEmail, siteUrl, adminUsername).catch(console.error);
            
            await runScript('setup_cron.sh', [subdomain]);
            console.log(`\n✨ Successfully completed all steps for ${subdomain}.`);

        } catch (error) {
            console.error(`🔥 An error occurred during the site creation process for ${subdomain}.`);
            console.error(error.message);
            sendFailureEmail(adminEmail, siteUrl, error.message).catch(console.error);
        }
    })();
}

app.listen(PORT, () => {
    console.log(`🚀 WordPress Creation API listening on port ${PORT}`);
    console.log(`   - Make sure your .env file is configured with API_SECRET_KEY, SCRIPTS_PATH, and DOMAIN_NAME.`);
});
