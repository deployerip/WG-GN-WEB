// Constants and Initial State
const DOM = {
    wireguardPurpose: document.getElementById('wireguard-purpose'),
    sections: {
        vpnOptions: document.getElementById('vpn-options'),
        dnsOptions: document.getElementById('dns-options'),
        customPeers: document.getElementById('custom-peers'),
        dnsManager: document.getElementById('dns-manager'),
        dnsManagerList: document.getElementById('dns-manager-list'),
    },
    buttons: {
        vpn: document.getElementById('vpn-btn'),
        dns: document.getElementById('dns-btn'),
        customPeers: document.getElementById('custom-peers-btn'),
        ipv4: document.getElementById('ipv4-btn'),
        ipv6: document.getElementById('ipv6-btn'),
        dnsChoices: {
            shecan: document.getElementById('shecan-btn'),
            online403: document.getElementById('403online-btn'),
            electro: document.getElementById('electro-btn'),
            cloudflare: document.getElementById('cloudflare-btn'),
            adguard: document.getElementById('adguard-btn'),
            google: document.getElementById('google-btn'),
            quad9: document.getElementById('quad9-btn'),
            opendns: document.getElementById('opendns-btn'),
        },
        getConfig: document.querySelector('.get-btn'),
        home: document.querySelector('.home-btn'),
        dnsManager: document.getElementById('dns-manager-btn'),
        select: document.getElementById('select-btn'),
        selectAll: document.getElementById('select-all-btn'),
        delete: document.getElementById('delete-btn'),
        saveDns: document.getElementById('save-dns-btn'),
        addManualDns: document.getElementById('add-manual-dns'),
        confirmYes: document.getElementById('confirm-yes-btn'),
        confirmNo: document.getElementById('confirm-no-btn'),
        qrClose: document.querySelector('.qr-close-btn'),
        dnsClose: document.getElementById('dns-close-btn'),
        back: document.querySelectorAll('.back-btn'),
        dnsBack: document.querySelector('.dns-back-btn'),
    },
    config: {
        wireGuard: document.querySelector('.wire-guard-config'),
        v2ray: document.querySelector('.v2ray-config'),
    },
    inputs: {
        ipv4Count: document.getElementById('ipv4-count'),
        ipv6Count: document.getElementById('ipv6-count'),
        manualDns: document.getElementById('manual-dns-input'),
    },
    popups: {
        qr: document.getElementById('qr-popup'),
        dns: document.getElementById('dns-popup'),
        confirmExit: document.getElementById('confirm-exit-popup'),
        qrContainer: document.getElementById('v2rayQR'),
    }
};

const state = {
    ipv4List: [],
    ipv6List: [],
    selectedDNS: null,
    selectedEndpointType: null,
    selectedDNSServers: ['1.1.1.1', '1.0.0.1', '2606:4700:4700::1111', '2606:4700:4700::1001'],
    tempDNSServers: [],
    editingDNS: null,
    isSelecting: false,
};

const dnsBrands = {
    '1.1.1.1': 'Cloudflare', '1.0.0.1': 'Cloudflare',
    '8.8.8.8': 'Google', '8.8.4.4': 'Google',
    '94.140.14.14': 'AdGuard', '94.140.15.15': 'AdGuard',
    '9.9.9.9': 'Quad9', '149.112.112.112': 'Quad9',
    '208.67.222.222': 'OpenDNS', '208.67.220.220': 'OpenDNS',
    '178.22.122.100': 'Shecan', '185.51.200.2': 'Shecan',
    '10.202.10.202': '403 Online', '10.202.10.102': '403 Online',
    '78.157.42.101': 'Electro', '78.157.42.100': 'Electro',
    '2606:4700:4700::1111': 'Cloudflare', '2606:4700:4700::1001': 'Cloudflare'
};

const dnsConfigs = {
    shecan: { servers: '178.22.122.100, 185.51.200.2', title: 'WireGuard Format (Shecan DNS)' },
    online403: { servers: '10.202.10.202, 10.202.10.102', title: 'WireGuard Format (403 Online DNS)' },
    electro: { servers: '78.157.42.101, 78.157.42.100', title: 'WireGuard Format (Electro DNS)' },
    cloudflare: { servers: '1.1.1.1, 1.0.0.1', title: 'WireGuard Format (Cloudflare DNS)' },
    adguard: { servers: '94.140.14.14, 94.140.15.15', title: 'WireGuard Format (AdGuard DNS)' },
    google: { servers: '8.8.8.8, 8.8.4.4', title: 'WireGuard Format (Google DNS)' },
    quad9: { servers: '9.9.9.9, 149.112.112.112', title: 'WireGuard Format (Quad9 DNS)' },
    opendns: { servers: '208.67.222.222, 208.67.220.220', title: 'WireGuard Format (OpenDNS)' },
};

// Utility Functions
const utils = {
    showSpinner: () => {
        document.querySelector('.spinner').style.display = 'flex';
        document.querySelector('main').style.opacity = '0';
    },
    hideSpinner: () => {
        document.querySelector('.spinner').style.display = 'none';
        document.querySelector('main').style.opacity = '1';
    },
    showPopup: (message, type = 'success') => {
        const popup = document.createElement('div');
        popup.classList.add('popup-message', type === 'error' ? 'error' : '');
        popup.innerHTML = `${message} <button class="close-btn"><i class="fas fa-times"></i></button>`;
        document.body.appendChild(popup);
        popup.querySelector('.close-btn').addEventListener('click', () => popup.remove());
        setTimeout(() => popup.remove(), 2500);
    },
    generateRandomString: (length) => Array(length).fill().map(() => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join(''),
    isValidIP: (ip) => /^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/.test(ip),
    downloadConfig: (fileName, content) => {
        const blob = new Blob([content], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName.endsWith('.conf') ? fileName : `${fileName}.conf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },
    scrollToConfig: () => {
        setTimeout(() => DOM.config.wireGuard.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    },
};

// API Functions
const api = {
    loadIPLists: async () => {
        const [ipv4Response, ipv6Response] = await Promise.all([
            fetch('js/ipv4.json'),
            fetch('js/ipv6.json')
        ]);
        state.ipv4List = await ipv4Response.json();
        state.ipv6List = await ipv6Response.json();
    },
    fetchKeys: async () => {
        const response = await fetch('https://wg.demo-keys-reg.workers.dev/keys');
        if (!response.ok) throw new Error(`Failed to fetch keys: ${response.status}`);
        const data = await response.text();
        const extractKey = (keyName) => data.match(new RegExp(`${keyName}:\\s(.+)`))?.[1].trim();
        return {
            publicKey: extractKey('PublicKey'),
            privateKey: extractKey('PrivateKey'),
        };
    },
    fetchAccount: async (publicKey, installId, fcmToken) => {
        const response = await fetch('https://www.iranguard.workers.dev/wg', {
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
    },
    fetchIPInfo: async () => {
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
    },
};

// Config Generation
const configGenerator = {
    updateDOMWithQR: (container, title, textareaId, content, messageId, hasQR = false) => {
        container.innerHTML = `
            <h2><i class="fas fa-code"></i> ${title}</h2>
            ${container === DOM.config.wireGuard ? `
                <button class="download-icon-btn" id="wireguard-download-btn">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM12 16l-4-4h3V8h2v4h3l-4 4z" />
                    </svg>
                </button>` : ''}
            <textarea id="${textareaId}" readonly>${content.trim()}</textarea>
            <button class="copy-button" data-target="${textareaId}" data-message="${messageId}">
                <i class="fas fa-copy"></i> Copy ${title}
            </button>
            ${hasQR && !content.includes('not supported') ? `
                <button class="qr-button" data-content="${content.trim()}">
                    <i class="fas fa-qrcode"></i> Show QR
                </button>` : ''}
            <p id="${messageId}" aria-live="polite"></p>
        `;
    },
    generateWireGuardConfig: (data, privateKey, peerCount, ipv4Count) => {
        let config = `[Interface]
PrivateKey = ${privateKey}
Address = ${data.config.interface.addresses.v4}/32, ${data.config.interface.addresses.v6}/128
DNS = ${state.selectedDNSServers.join(', ')}
MTU = 1280\n\n`;
        
        for (let i = 0; i < peerCount; i++) {
            const peerType = i < ipv4Count ? 'ipv4' : 'ipv6';
            const endpoint = peerCount === 1 ? 
                configGenerator.getRandomEndpoint(state.selectedEndpointType) : 
                configGenerator.getRandomEndpoint(peerType);
            config += `[Peer]
PublicKey = bmXOC+F1FxEMF9dyiK2H5/1SUtzH0JuVo51h2wPfgyo=
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = ${endpoint}\n\n`;
        }
        return config.trim();
    },
    generateV2RayURL: (privateKey, publicKey, ipv4, ipv6, reserved) => {
        const endpoint = configGenerator.getRandomEndpoint(state.selectedEndpointType);
        return `wireguard://${encodeURIComponent(privateKey)}@${endpoint}?address=${encodeURIComponent(ipv4 + '/32')},${encodeURIComponent(ipv6 + '/128')}&reserved=${reserved}&publickey=${encodeURIComponent(publicKey)}&mtu=1420#V2ray-Config`;
    },
    getRandomEndpoint: (type) => {
        const list = type === 'ipv4' ? state.ipv4List : state.ipv6List;
        return list[Math.floor(Math.random() * list.length)];
    },
};

// DNS Manager
const dnsManager = {
    updateList: () => {
        DOM.sections.dnsManagerList.innerHTML = '';
        const addButton = document.createElement('button');
        addButton.classList.add('add-dns-btn');
        addButton.innerHTML = '<i class="fas fa-plus"></i>';
        addButton.addEventListener('click', () => {
            DOM.inputs.manualDns.value = '';
            state.editingDNS = null;
            DOM.popups.dns.classList.remove('hidden');
        });
        DOM.sections.dnsManagerList.appendChild(addButton);

        state.tempDNSServers.forEach(dns => {
            const brand = dnsBrands[dns] || dns;
            const item = document.createElement('div');
            item.classList.add('dns-manager-item');
            item.dataset.dns = dns;
            item.innerHTML = `<span>${brand}</span>`;
            item.addEventListener('click', state.isSelecting ? 
                () => item.classList.toggle('selected') :
                () => {
                    state.editingDNS = dns;
                    DOM.inputs.manualDns.value = dns;
                    DOM.popups.dns.classList.remove('hidden');
                }
            );
            DOM.sections.dnsManagerList.appendChild(item);
        });
    },
    updateCount: () => {
        document.getElementById('dns-count').textContent = state.selectedDNSServers.length;
    },
    addDns: (dns) => {
        if (!state.tempDNSServers.includes(dns)) {
            state.tempDNSServers.push(dns);
            dnsManager.updateList();
        }
    },
};

// Event Handlers
const handlers = {
    navigateToSection: (hide, show) => () => {
        DOM.wireguardPurpose.classList.add('hidden');
        DOM.sections[hide]?.classList.add('hidden');
        DOM.sections[show].classList.remove('hidden');
    },
    handleBack: (btn) => () => {
        if (btn.classList.contains('dns-back-btn')) {
            if (JSON.stringify(state.selectedDNSServers) !== JSON.stringify(state.tempDNSServers)) {
                DOM.popups.confirmExit.classList.remove('hidden');
            } else {
                DOM.sections.dnsManager.classList.add('hidden');
                DOM.sections.customPeers.classList.remove('hidden');
            }
        } else {
            const current = btn.closest('div:not(.hidden)');
            if (current.id === 'vpn-options' || current.id === 'dns-options') {
                current.classList.add('hidden');
                DOM.wireguardPurpose.classList.remove('hidden');
            } else if (current.id === 'custom-peers') {
                current.classList.add('hidden');
                DOM.sections.vpnOptions.classList.remove('hidden');
            }
            DOM.config.wireGuard.innerHTML = '';
            DOM.config.v2ray.innerHTML = '';
            DOM.buttons.home.style.display = 'none';
        }
    },
    generatePersonalConfig: async (peerCount, ipv4Count, ipv6Count) => {
        try {
            utils.showSpinner();
            DOM.buttons.getConfig.disabled = true;
            DOM.buttons.getConfig.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            
            await api.loadIPLists();
            const { publicKey, privateKey } = await api.fetchKeys();
            const installId = utils.generateRandomString(22);
            const fcmToken = `${installId}:APA91b${utils.generateRandomString(134)}`;
            const accountData = await api.fetchAccount(publicKey, installId, fcmToken);

            const reserved = Array.from(atob(accountData.config.client_id)).map(char => char.charCodeAt(0)).slice(0, 3).join('%2C');
            const wireGuardText = configGenerator.generateWireGuardConfig(accountData, privateKey, peerCount, ipv4Count);
            const v2rayText = peerCount === 1 ? 
                configGenerator.generateV2RayURL(privateKey, accountData.config.peers[0].public_key, accountData.config.interface.addresses.v4, accountData.config.interface.addresses.v6, reserved) : 
                'V2Ray format is not supported for more than 1 peer.';

            DOM.sections.customPeers.classList.add('hidden');
            configGenerator.updateDOMWithQR(DOM.config.wireGuard, 'WireGuard Format', 'wireguardBox', wireGuardText, 'message1', false);
            configGenerator.updateDOMWithQR(DOM.config.v2ray, 'V2Ray Format', 'v2rayBox', v2rayText, 'message2', true);
            DOM.buttons.home.style.display = 'flex';

            document.querySelectorAll('.copy-button').forEach(btn => 
                btn.addEventListener('click', async (e) => {
                    const targetId = btn.dataset.target;
                    const messageId = btn.dataset.message;
                    try {
                        await navigator.clipboard.writeText(document.getElementById(targetId).value);
                        utils.showPopup('Config copied successfully!');
                    } catch (error) {
                        console.error('Copy failed:', error);
                        utils.showPopup('Failed to copy', 'error');
                    }
                })
            );

            document.getElementById('wireguard-download-btn')?.addEventListener('click', () => {
                utils.downloadConfig(state.selectedDNS ? 'wireguard.conf' : 'config', wireGuardText);
                utils.showPopup('Configuration file downloaded');
            });

            document.querySelectorAll('.qr-button').forEach(btn => 
                btn.addEventListener('click', () => {
                    const content = btn.dataset.content;
                    if (!content.includes('not supported')) {
                        DOM.popups.qrContainer.innerHTML = '';
                        new QRCode(DOM.popups.qrContainer, {
                            text: content,
                            width: 300,
                            height: 300,
                            colorDark: "#000000",
                            colorLight: "#ffffff",
                            correctLevel: QRCode.CorrectLevel.H
                        });
                        DOM.popups.qr.style.display = 'block';
                    }
                })
            );

            utils.scrollToConfig();
        } catch (error) {
            console.error('Config generation failed:', error);
            utils.showPopup('Error generating configuration', 'error');
        } finally {
            utils.hideSpinner();
            DOM.buttons.getConfig.disabled = false;
            DOM.buttons.getConfig.innerHTML = '<i class="fas fa-cogs"></i> Generate Config';
        }
    },
    generateDNSConfig: async () => {
        try {
            utils.showSpinner();
            await api.loadIPLists();
            const { publicKey, privateKey } = await api.fetchKeys();
            const installId = utils.generateRandomString(22);
            const fcmToken = `${installId}:APA91b${utils.generateRandomString(134)}`;
            const accountData = await api.fetchAccount(publicKey, installId, fcmToken);

            const { servers, title } = dnsConfigs[state.selectedDNS];
            const configText = `[Interface]
PrivateKey = ${privateKey}
Address = ${accountData.config.interface.addresses.v4}/32, ${accountData.config.interface.addresses.v6}/128
DNS = ${servers}
MTU = 1280`;

            DOM.sections.dnsOptions.classList.add('hidden');
            configGenerator.updateDOMWithQR(DOM.config.wireGuard, title, 'wireguardBox', configText, 'message1', false);
            configGenerator.updateDOMWithQR(DOM.config.v2ray, 'V2Ray Format', 'v2rayBox', 'V2Ray format is not supported for this configuration', 'message2', false);
            DOM.buttons.home.style.display = 'flex';

            document.querySelectorAll('.copy-button').forEach(btn => 
                btn.addEventListener('click', async (e) => {
                    const targetId = btn.dataset.target;
                    try {
                        await navigator.clipboard.writeText(document.getElementById(targetId).value);
                        utils.showPopup('Config copied successfully!');
                    } catch (error) {
                        console.error('Copy failed:', error);
                        utils.showPopup('Failed to copy', 'error');
                    }
                })
            );

            document.getElementById('wireguard-download-btn')?.addEventListener('click', () => {
                utils.downloadConfig('wireguard.conf', configText);
                utils.showPopup('Configuration file downloaded');
            });

            utils.scrollToConfig();
        } catch (error) {
            console.error('DNS config generation failed:', error);
            utils.showPopup('Error generating DNS configuration', 'error');
        } finally {
            utils.hideSpinner();
        }
    },
};

// Event Listeners
const initEventListeners = () => {
    DOM.buttons.vpn.addEventListener('click', handlers.navigateToSection(null, 'vpnOptions'));
    DOM.buttons.dns.addEventListener('click', handlers.navigateToSection(null, 'dnsOptions'));
    DOM.buttons.customPeers.addEventListener('click', handlers.navigateToSection('vpnOptions', 'customPeers'));
    DOM.buttons.ipv4.addEventListener('click', () => {
        state.selectedEndpointType = 'ipv4';
        handlers.generatePersonalConfig(1, 1, 0);
    });
    DOM.buttons.ipv6.addEventListener('click', () => {
        state.selectedEndpointType = 'ipv6';
        handlers.generatePersonalConfig(1, 0, 1);
    });
    DOM.buttons.getConfig.addEventListener('click', () => {
        const ipv4Count = parseInt(DOM.inputs.ipv4Count.value) || 0;
        const ipv6Count = parseInt(DOM.inputs.ipv6Count.value) || 0;
        handlers.generatePersonalConfig(ipv4Count + ipv6Count, ipv4Count, ipv6Count);
    });
    DOM.buttons.home.addEventListener('click', () => {
        DOM.config.wireGuard.innerHTML = '';
        DOM.config.v2ray.innerHTML = '';
        DOM.buttons.home.style.display = 'none';
        DOM.wireguardPurpose.classList.remove('hidden');
    });

    Object.entries(DOM.buttons.dnsChoices).forEach(([key, btn]) => {
        btn.addEventListener('click', () => {
            state.selectedDNS = key;
            handlers.generateDNSConfig();
        });
    });

    DOM.buttons.back.forEach(btn => btn.addEventListener('click', handlers.handleBack(btn)));
    DOM.buttons.dnsManager.addEventListener('click', () => {
        DOM.sections.customPeers.classList.add('hidden');
        DOM.sections.dnsManager.classList.remove('hidden');
        dnsManager.updateList();
    });
    DOM.buttons.select.addEventListener('click', () => {
        state.isSelecting = !state.isSelecting;
        DOM.buttons.select.innerHTML = state.isSelecting ? 
            '<i class="fas fa-times"></i> Cancel' : 
            '<i class="fas fa-check-square"></i> Select';
        DOM.buttons.selectAll.classList.toggle('hidden', !state.isSelecting);
        DOM.buttons.delete.classList.toggle('hidden', !state.isSelecting);
        dnsManager.updateList();
    });
    DOM.buttons.selectAll.addEventListener('click', () => {
        const items = document.querySelectorAll('.dns-manager-item');
        const allSelected = Array.from(items).every(item => item.classList.contains('selected'));
        items.forEach(item => item.classList[allSelected ? 'remove' : 'add']('selected'));
    });
    DOM.buttons.delete.addEventListener('click', () => {
        state.tempDNSServers = state.tempDNSServers.filter(dns => {
            const item = document.querySelector(`.dns-manager-item[data-dns="${dns}"]`);
            return !item || !item.classList.contains('selected');
        });
        dnsManager.updateList();
    });
    DOM.buttons.saveDns.addEventListener('click', () => {
        state.selectedDNSServers = [...state.tempDNSServers];
        dnsManager.updateCount();
        DOM.sections.dnsManager.classList.add('hidden');
        DOM.sections.customPeers.classList.remove('hidden');
    });
    DOM.buttons.confirmYes.addEventListener('click', () => {
        state.tempDNSServers = [...state.selectedDNSServers];
        DOM.popups.confirmExit.classList.add('hidden');
        DOM.sections.dnsManager.classList.add('hidden');
        DOM.sections.customPeers.classList.remove('hidden');
    });
    DOM.buttons.confirmNo.addEventListener('click', () => {
        DOM.popups.confirmExit.classList.add('hidden');
    });
    DOM.buttons.dnsClose.addEventListener('click', () => {
        DOM.popups.dns.classList.add('hidden');
        DOM.inputs.manualDns.value = '';
        state.editingDNS = null;
    });
    DOM.buttons.addManualDns.addEventListener('click', () => {
        const dns = DOM.inputs.manualDns.value.trim();
        if (dns && utils.isValidIP(dns)) {
            if (state.editingDNS) {
                const index = state.tempDNSServers.indexOf(state.editingDNS);
                if (index !== -1) state.tempDNSServers[index] = dns;
                state.editingDNS = null;
            } else {
                dnsManager.addDns(dns);
            }
            DOM.popups.dns.classList.add('hidden');
            DOM.inputs.manualDns.value = '';
        } else if (dns) {
            utils.showPopup('Please enter a valid IP address', 'error');
        }
    });
    document.querySelectorAll('.dns-choice').forEach(btn => {
        btn.addEventListener('click', () => {
            const dnsList = btn.getAttribute('data-dns').split(', ');
            dnsList.forEach(dns => {
                if (state.editingDNS) {
                    const index = state.tempDNSServers.indexOf(state.editingDNS);
                    if (index !== -1) state.tempDNSServers[index] = dns;
                    state.editingDNS = null;
                } else {
                    dnsManager.addDns(dns);
                }
            });
            DOM.popups.dns.classList.add('hidden');
        });
    });
    DOM.buttons.qrClose.addEventListener('click', () => {
        DOM.popups.qr.style.display = 'none';
    });
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    state.tempDNSServers = [...state.selectedDNSServers];
    initEventListeners();
    api.fetchIPInfo();
    dnsManager.updateCount();
});