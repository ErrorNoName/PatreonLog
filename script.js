document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const loginBtn = document.querySelector('.login-btn');
    const loadingText = document.querySelector('.loading');
    const username = document.getElementById('username').value;
    const token = document.getElementById('token').value;

    loginBtn.style.display = 'none';
    loadingText.style.display = 'block';

    const userDataUrl = "https://pastebin.com/raw/cv1v13TC";
    const softwareConfigUrl = "https://pastebin.com/raw/4JwSBf73";

    try {
        const userData = parseUserData(await fetchDataFromPastebin(userDataUrl));
        const softwareConfig = parseSoftwareConfig(await fetchDataFromPastebin(softwareConfigUrl));

        if (userData[username] && userData[username].token === token) {
            displaySoftware(userData[username].roles, softwareConfig);
            loadingText.textContent = 'Access granted';
            document.querySelector('.login-form').style.display = 'none';
            document.getElementById('tools').classList.add('active');
            document.getElementById('dashboard').classList.remove('active');
        } else {
            loadingText.textContent = 'Access denied. Invalid credentials.';
            setTimeout(() => {
                loginBtn.style.display = 'block';
                loadingText.style.display = 'none';
            }, 2000);
        }
    } catch (error) {
        loadingText.textContent = 'Failed to load data. Try again.';
        console.error('Failed to fetch data:', error);
    }
});

function fetchDataFromPastebin(url) {
    const https = require('https');
    return new Promise((resolve, reject) => {
        https.get(url, (resp) => {
            let data = '';

            resp.on('data', (chunk) => {
                data += chunk;
            });

            resp.on('end', () => {
                resolve(data);
            });

        }).on("error", (err) => {
            console.error("Erreur lors de la récupération des données de Pastebin:", err);
            reject(err);
        });
    });
}

function parseUserData(data) {
    const users = {};
    const lines = data.trim().split('\n').slice(2); // Skip the first two lines (headers and separator)
    lines.forEach(line => {
        const [userId, token, roles] = line.split(' | ');
        users[userId] = { token, roles: roles.split(',') };
    });
    return users;
}

function parseSoftwareConfig(data) {
    return JSON.parse(data);
}

function displaySoftware(userRoles, softwareConfig) {
    const toolsList = document.getElementById('toolsList');
    const downloadsList = document.getElementById('downloadsList');
    toolsList.innerHTML = '';
    downloadsList.innerHTML = '';

    userRoles.forEach(roleId => {
        const role = softwareConfig.roles.find(r => r.id === roleId);
        if (role) {
            role.software.forEach(software => {
                // Tools Section - Launch Tool directly
                const toolItem = document.createElement('div');
                toolItem.classList.add('software-item');
                toolItem.innerHTML = `
                    <p style="color: #ddd;"><strong>${software.name}</strong></p>
                    <button class="launch-btn" data-url="${software.url}" style="margin-right: 10px;">Launch</button>
                `;
                toolsList.appendChild(toolItem);

                // Downloads Section - Only show downloadable tools
                const downloadItem = document.createElement('div');
                downloadItem.classList.add('software-item');
                downloadItem.innerHTML = `
                    <p style="color: #ddd;"><strong>${software.name}</strong></p>
                    <button class="download-btn" data-url="${software.url}" style="margin-right: 10px;">Download</button>
                    <div class="download-progress" style="display: none; color: #ddd;">Downloading...</div>
                `;
                downloadsList.appendChild(downloadItem);
            });
        }
    });

    // Event listeners for launching and downloading tools
    document.querySelectorAll('.launch-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const url = this.getAttribute('data-url');
            // Launch the tool directly from the panel (example: open a URL in browser)
            require('electron').shell.openExternal(url);
        });
    });

    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const url = this.getAttribute('data-url');
            const progress = this.nextElementSibling;  // The progress indicator
            progress.style.display = 'block';
            
            // Simulate download with progress
            simulateDownload(url, progress);
        });
    });
}

function simulateDownload(url, progressElement) {
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        progressElement.textContent = `Downloading... ${progress}%`;

        if (progress >= 100) {
            clearInterval(interval);
            progressElement.textContent = `Download complete!`;
        }
    }, 500); // Simulate download progress every 500ms

    // In a real scenario, you would use a library like `electron-fetch` or `request` to download the file to a secure location.
}
