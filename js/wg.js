const wireguardPurpose = document.getElementById('wireguard-purpose');
const vpnBtn = document.getElementById('vpn-btn');
const dnsBtn = document.getElementById('dns-btn');
const vpnOptions = document.getElementById('vpn-options');
const customPeersBtn = document.getElementById('custom-peers-btn');
const ipv4Btn = document.getElementById('ipv4-btn');
const ipv6Btn = document.getElementById('ipv6-btn');
const customPeers = document.getElementById('custom-peers');
const dnsOptions = document.getElementById('dns-options');
const shecanBtn = document.getElementById('shecan-btn');
const online403Btn = document.getElementById('403online-btn');
const electroBtn = document.getElementById('electro-btn');
const cloudflareBtn = document.getElementById('cloudflare-btn');
const adguardBtn = document.getElementById('adguard-btn');
const googleBtn = document.getElementById('google-btn');
const quad9Btn = document.getElementById('quad9-btn');
const opendnsBtn = document.getElementById('opendns-btn');
const getConfigBtn = document.querySelector('.get-btn');
const homeBtn = document.querySelector('.home-btn');
const wireGuardConfig = document.querySelector('.wire-guard-config');
const v2rayConfig = document.querySelector('.v2ray-config');
const ipv4CountInput = document.getElementById('ipv4-count');
const ipv6CountInput = document.getElementById('ipv6-count');
const backButtons = document.querySelectorAll('.back-btn');
const qrPopup = document.getElementById('qr-popup');
const qrCloseBtn = document.querySelector('.qr-close-btn');
const addDnsBtn = document.getElementById('add-dns-btn');
const dnsPopup = document.getElementById('dns-popup');
const dnsCloseBtn = document.getElementById('dns-close-btn');
const manualDnsInput = document.getElementById('manual-dns-input');
const addManualDnsBtn = document.getElementById('add-manual-dns');
const dnsList = document.getElementById('dns-list');

let ipv4List = [];
let ipv6List = [];
let selectedDNS = null;
let selectedEndpointType = null;
let selectedDNSServers = ['1.1.1.1', '1.0.0.1', '2606:4700:4700::1111', '2606:4700:4700::1001']; // Default DNS

const loadIPLists = async () => {
    const [ipv4Response, ipv6Response] = await Promise.all([
        fetch('js/ipv4.json'),
        fetch('js/ipv6.json')
    ]);
    ipv4List = await ipv4Response.json();
    ipv6List = await ipv6Response.json();
};

vpnBtn.addEventListener('click', () => {
    wireguardPurpose.classList.add('hidden');
    vpnOptions.classList.remove('hidden');
});

dnsBtn.addEventListener('click', () => {
    wireguardPurpose.classList.add('hidden');
    dnsOptions.classList.remove('hidden');
});

customPeersBtn.addEventListener('click', () => {
    vpnOptions.classList.add('hidden');
    customPeers.classList.remove('hidden');
});

ipv4Btn.addEventListener('click', () => {
    selectedEndpointType = 'ipv4';
    vpnOptions.classList.add('hidden');
    generatePersonalConfig(1, 1, 0);
});

ipv6Btn.addEventListener('click', () => {
    selectedEndpointType = 'ipv6';
    vpnOptions.classList.add('hidden');
    generatePersonalConfig(1, 0, 1);
});

shecanBtn.addEventListener('click', () => {
    selectedDNS = 'shecan';
    dnsOptions.classList.add('hidden');
    generateDNSConfig();
});

online403Btn.addEventListener('click', () => {
    selectedDNS = '403online';
    dnsOptions.classList.add('hidden');
    generateDNSConfig();
});

electroBtn.addEventListener('click', () => {
    selectedDNS = 'electro';
    dnsOptions.classList.add('hidden');
    generateDNSConfig();
});

cloudflareBtn.addEventListener('click', () => {
    selectedDNS = 'cloudflare';
    dnsOptions.classList.add('hidden');
    generateDNSConfig();
});

adguardBtn.addEventListener('click', () => {
    selectedDNS = 'adguard';
    dnsOptions.classList.add('hidden');
    generateDNSConfig();
});

googleBtn.addEventListener('click', () => {
    selectedDNS = 'google';
    dnsOptions.classList.add('hidden');
    generateDNSConfig();
});

quad9Btn.addEventListener('click', () => {
    selectedDNS = 'quad9';
    dnsOptions.classList.add('hidden');
    generateDNSConfig();
});

opendnsBtn.addEventListener('click', () => {
    selectedDNS = 'opendns';
    dnsOptions.classList.add('hidden');
    generateDNSConfig();
});

backButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const currentSection = btn.closest('div:not(.hidden)');
        if (currentSection.id === 'vpn-options' || currentSection.id === 'dns-options') {
            currentSection.classList.add('hidden');
            wireguardPurpose.classList.remove('hidden');
        } else if (currentSection.id === 'custom-peers') {
            currentSection.classList.add('hidden');
            vpnOptions.classList.remove('hidden');
        }
        wireGuardConfig.innerHTML = '';
        v2rayConfig.innerHTML = '';
        homeBtn.style.display = 'none';
    });
});

getConfigBtn.addEventListener('click', () => {
    getConfigBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    getConfigBtn.disabled = true;
    const ipv4Count = parseInt(ipv4CountInput.value) || 0;
    const ipv6Count = parseInt(ipv6CountInput.value) || 0;
    customPeers.classList.add('hidden');
    generatePersonalConfig(ipv4Count + ipv6Count, ipv4Count, ipv6Count);
});

homeBtn.addEventListener('click', () => {
    wireGuardConfig.innerHTML = '';
    v2rayConfig.innerHTML = '';
    homeBtn.style.display = 'none';
    wireguardPurpose.classList.remove('hidden');
});

addDnsBtn.addEventListener('click', () => {
    dnsPopup.classList.remove('hidden');
});

dnsCloseBtn.addEventListener('click', () => {
    dnsPopup.classList.add('hidden');
    manualDnsInput.value = '';
});

addManualDnsBtn.addEventListener('click', () => {
    const dns = manualDnsInput.value.trim();
    if (dns && isValidIP(dns)) {
        addDnsToList(dns);
        dnsPopup.classList.add('hidden');
        manualDnsInput.value = '';
    } else {
        showPopup('Please enter a valid IP address', 'error');
    }
});

document.querySelectorAll('.dns-choice').forEach(btn => {
    btn.addEventListener('click', () => {
        const dns = btn.getAttribute('data-dns').split(', ');
        dns.forEach(ip => addDnsToList(ip));
        dnsPopup.classList.add('hidden');
    });
});

async function generatePersonalConfig(peerCount, ipv4Count, ipv6Count) {
    try {
        showSpinner();
        await loadIPLists();
        const { publicKey, privateKey } = await fetchKeys();
        const installId = generateRandomString(22);
        const fcmToken = `${installId}:APA91b${generateRandomString(134)}`;
        const accountData = await fetchAccount(publicKey, installId, fcmToken);
        if (accountData) {
            const reserved = generateReserved(accountData.config.client_id);
            const wireGuardText = generateWireGuardConfig(accountData, privateKey, peerCount, ipv4Count, ipv6Count);
            const v2rayText = peerCount === 1 ? generateV2RayURL(
                privateKey,
                accountData.config.peers[0].public_key,
                accountData.config.interface.addresses.v4,
                accountData.config.interface.addresses.v6,
                reserved
            ) : 'V2Ray format is not supported for more than 1 peer.';
            updateDOMWithQR(wireGuardConfig, 'WireGuard Format', 'wireguardBox', wireGuardText, 'message1', null);
            updateDOMWithQR(v2rayConfig, 'V2Ray Format', 'v2rayBox', v2rayText, 'message2', 'v2rayQR');
            homeBtn.style.display = 'flex';
            addCopyListeners();
            addDownloadListener();
            addQRListener(v2rayText);
        }
    } catch (error) {
        console.error('Error processing configuration:', error);
    } finally {
        hideSpinner();
        getConfigBtn.disabled = false;
        getConfigBtn.innerHTML = '<i class="fas fa-cogs"></i> Generate Config';
        scrollToConfig();
    }
}

async function generateDNSConfig() {
    try {
        showSpinner();
        await loadIPLists();
        const { publicKey, privateKey } = await fetchKeys();
        const installId = generateRandomString(22);
        const fcmToken = `${installId}:APA91b${generateRandomString(134)}`;
        const accountData = await fetchAccount(publicKey, installId, fcmToken);
        if (accountData) {
            let dnsServers;
            let title;
            switch (selectedDNS) {
                case 'shecan':
                    dnsServers = '178.22.122.100, 185.51.200.2';
                    title = 'WireGuard Format (Shecan DNS)';
                    break;
                case '403online':
                    dnsServers = '10.202.10.202, 10.202.10.102';
                    title = 'WireGuard Format (403 Online DNS)';
                    break;
                case 'electro':
                    dnsServers = '78.157.42.101, 78.157.42.100';
                    title = 'WireGuard Format (Electro DNS)';
                    break;
                case 'cloudflare':
                    dnsServers = '1.1.1.1, 1.0.0.1';
                    title = 'WireGuard Format (Cloudflare DNS)';
                    break;
                case 'adguard':
                    dnsServers = '94.140.14.14, 94.140.15.15';
                    title = 'WireGuard Format (AdGuard DNS)';
                    break;
                case 'google':
                    dnsServers = '8.8.8.8, 8.8.4.4';
                    title = 'WireGuard Format (Google DNS)';
                    break;
                case 'quad9':
                    dnsServers = '9.9.9.9, 149.112.112.112';
                    title = 'WireGuard Format (Quad9 DNS)';
                    break;
                case 'opendns':
                    dnsServers = '208.67.222.222, 208.67.220.220';
                    title = 'WireGuard Format (OpenDNS)';
                    break;
            }
            const configText = `[Interface]
PrivateKey = ${privateKey}
Address = ${accountData.config.interface.addresses.v4}/32, ${accountData.config.interface.addresses.v6}/128
DNS = ${dnsServers}
MTU = 1280`;
            updateDOMWithQR(wireGuardConfig, title, 'wireguardBox', configText, 'message1', null);
            updateDOMWithQR(v2rayConfig, 'V2Ray Format', 'v2rayBox', 'V2Ray format is not supported for this configuration', 'message2', 'v2rayQR');
            homeBtn.style.display = 'flex';
            addCopyListeners();
            addDownloadListener();
        }
    } catch (error) {
        console.error('Error processing configuration:', error);
    } finally {
        hideSpinner();
        scrollToConfig();
    }
}

const fetchKeys = async () => {
    const response = await fetch('https://wg.demo-keys-reg.workers.dev/keys');
    if (!response.ok) throw new Error(`Failed to fetch keys: ${response.status}`);
    const data = await response.text();
    return {
        publicKey: extractKey(data, 'PublicKey'),
        privateKey: extractKey(data, 'PrivateKey'),
    };
};

const extractKey = (data, keyName) =>
    data.match(new RegExp(`${keyName}:\\s(.+)`))?.[1].trim() || null;

const fetchAccount = async (publicKey, installId, fcmToken) => {
    const apiUrl = 'https://www.iranguard.workers.dev/wg';
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'User-Agent': 'okhttp/3.12.1',
            'CF-Client-Version': 'a-6.10-2158',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            key: publicKey,
            install_id: installId,
            fcm_token: fcmToken,
            tos: new Date().toISOString(),
            model: 'PC',
            serial_number: installId,
            locale: 'de_DE',
        }),
    });
    if (!response.ok) throw new Error(`Failed to fetch account: ${response.status}`);
    return response.json();
};

const generateWireGuardConfig = (data, privateKey, peerCount, ipv4Count, ipv6Count) => {
    let configText = `[Interface]
PrivateKey = ${privateKey}
Address = ${data.config.interface.addresses.v4}/32, ${data.config.interface.addresses.v6}/128
DNS = ${selectedDNSServers.join(', ')}
MTU = 1280

`;
    for (let i = 0; i < peerCount; i++) {
        const peerType = i < ipv4Count ? 'ipv4' : 'ipv6';
        const endpoint = peerCount === 1 ? getRandomEndpoint(selectedEndpointType) : getRandomEndpoint(peerType);
        configText += `[Peer]
PublicKey = bmXOC+F1FxEMF9dyiK2H5/1SUtzH0JuVo51h2wPfgyo=
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = ${endpoint}

`;
    }
    return configText.trim();
};

const generateReserved = (clientId) =>
    Array.from(atob(clientId))
        .map((char) => char.charCodeAt(0))
        .slice(0, 3)
        .join('%2C');

const generateV2RayURL = (privateKey, publicKey, ipv4, ipv6, reserved) => {
    const endpoint = getRandomEndpoint(selectedEndpointType);
    return `wireguard://${encodeURIComponent(privateKey)}@${endpoint}?address=${encodeURIComponent(
        ipv4 + '/32'
    )},${encodeURIComponent(ipv6 + '/128')}&reserved=${reserved}&publickey=${encodeURIComponent(
        publicKey
    )}&mtu=1420#V2ray-Config`;
};

const getRandomEndpoint = (type = null) => {
    const endpointType = type || selectedEndpointType;
    const ipList = endpointType === 'ipv4' ? ipv4List : ipv6List;
    const randomIndex = Math.floor(Math.random() * ipList.length);
    return ipList[randomIndex];
};

const updateDOMWithQR = (container, title, textareaId, content, messageId, qrId) => {
    if (container.classList.contains('wire-guard-config')) {
        container.innerHTML = `
            <h2><i class="fas fa-code"></i> ${title}</h2>
            <button class="download-icon-btn" id="wireguard-download-btn">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM12 16l-4-4h3V8h2v4h3l-4 4z" />
                </svg>
            </button>
            <textarea id="${textareaId}" readonly>${content.trim()}</textarea>
            <button class="copy-button" data-target="${textareaId}" data-message="${messageId}"><i class="fas fa-copy"></i> Copy ${title}</button>
            <p id="${messageId}" aria-live="polite"></p>
        `;
    } else {
        container.innerHTML = `
            <h2><i class="fas fa-code"></i> ${title}</h2>
            <textarea id="${textareaId}" readonly>${content.trim()}</textarea>
            <button class="copy-button" data-target="${textareaId}" data-message="${messageId}"><i class="fas fa-copy"></i> Copy ${title}</button>
            <button class="qr-button" data-content="${content.trim()}"><i class="fas fa-qrcode"></i> Show QR</button>
            <p id="${messageId}" aria-live="polite"></p>
        `;
    }
};

const addCopyListeners = () => {
    document.querySelectorAll('.copy-button').forEach(btn => {
        btn.addEventListener('click', handleCopyButtonClick);
    });
};

const addDownloadListener = () => {
    const downloadBtn = document.getElementById('wireguard-download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const content = document.querySelector('#wireguardBox')?.value || "No configuration available";
            if (content === "No configuration available") return;
            downloadConfig(selectedDNS ? 'wireguard.conf' : 'config', content);
            showPopup('Configuration file downloaded');
        });
    }
};

const addQRListener = (content) => {
    document.querySelectorAll('.qr-button').forEach(btn => {
        btn.addEventListener('click', () => {
            const qrContent = btn.getAttribute('data-content');
            if (!qrContent.includes('not supported')) {
                document.getElementById('v2rayQR').innerHTML = '';
                new QRCode(document.getElementById('v2rayQR'), {
                    text: qrContent,
                    width: 300,
                    height: 300,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });
                qrPopup.style.display = 'block';
            }
        });
    });
};

qrCloseBtn.addEventListener('click', () => {
    qrPopup.style.display = 'none';
});

const showSpinner = () => {
    document.querySelector('.spinner').style.display = 'flex';
    document.querySelector('main').style.opacity = '0';
};

const hideSpinner = () => {
    document.querySelector('.spinner').style.display = 'none';
    document.querySelector('main').style.opacity = '1';
};

const handleCopyButtonClick = async function(e) {
    const targetId = this.getAttribute('data-target');
    const messageId = this.getAttribute('data-message');
    try {
        const textArea = document.getElementById(targetId);
        await navigator.clipboard.writeText(textArea.value);
        showPopup('Config copied successfully!');
        showCopyMessage(messageId, 'Copied!', 'success');
    } catch (error) {
        console.error('Copy failed:', error);
        showCopyMessage(messageId, 'Failed to copy', 'error');
    }
};

const showCopyMessage = (messageId, message, type = 'success') => {
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.style.color = type === 'success' ? '#00b894' : '#ff7675';
        messageElement.style.fontWeight = '500';
        setTimeout(() => messageElement.textContent = '', 2000);
    }
};

const showPopup = (message, type = 'success') => {
    const popup = document.createElement('div');
    popup.classList.add('popup-message');
    if (type === 'error') popup.classList.add('error');
    popup.innerHTML = `${message} <button class="close-btn"><i class="fas fa-times"></i></button>`;
    document.body.appendChild(popup);

    const closeBtn = popup.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => popup.remove());

    setTimeout(() => {
        if (document.body.contains(popup)) {
            popup.style.animation = 'fadeInOut 0.5s forwards';
            setTimeout(() => popup.remove(), 500);
        }
    }, 2500);
};

const generateRandomString = (length) =>
    Array.from({ length }, () =>
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(
            Math.floor(Math.random() * 62)
        )
    ).join('');

const downloadConfig = (fileName, content) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'application/octet-stream' });
    element.href = URL.createObjectURL(file);
    const finalFileName = fileName.endsWith('.conf') ? fileName : `${fileName}.conf`;
    element.download = finalFileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};

const scrollToConfig = () => {
    setTimeout(() => {
        if (wireGuardConfig.firstChild || v2rayConfig.firstChild) {
            wireGuardConfig.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 300);
};

function addDnsToList(dns) {
    if (!selectedDNSServers.includes(dns)) {
        selectedDNSServers.push(dns);
        updateDnsList();
    }
}

function removeDnsFromList(dns) {
    selectedDNSServers = selectedDNSServers.filter(ip => ip !== dns);
    updateDnsList();
}

function updateDnsList() {
    dnsList.innerHTML = '';
    selectedDNSServers.forEach(dns => {
        const dnsItem = document.createElement('div');
        dnsItem.classList.add('dns-item');
        dnsItem.innerHTML = `
            <span>${dns}</span>
            <button class="remove-dns" data-dns="${dns}"><i class="fas fa-times"></i></button>
        `;
        dnsList.appendChild(dnsItem);
    });
    document.querySelectorAll('.remove-dns').forEach(btn => {
        btn.addEventListener('click', () => {
            removeDnsFromList(btn.getAttribute('data-dns'));
        });
    });
}

function isValidIP(ip) {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

const fetchIPInfo = async () => {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        document.getElementById('user-ip').textContent = data.ip || 'Unknown';
        document.getElementById('user-country').textContent = data.country_name || 'Unknown';
    } catch (error) {
        console.error('Error fetching IP info:', error);
        document.getElementById('user-ip').textContent = 'Error';
        document.getElementById('user-country').textContent = 'Error';
    }
};

// Initialize DNS list and fetch IP info on load
document.addEventListener('DOMContentLoaded', () => {
    fetchIPInfo();
    updateDnsList();
});