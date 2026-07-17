import { SerialPort } from 'serialport';

const HONO_BASE = 'http://127.0.0.1:3000';
const SERIAL_PATH = 'COM5';
const BAUD_RATE = 115200;

const port = new SerialPort({ path: SERIAL_PATH, baudRate: BAUD_RATE });

console.log(`Bridge aktif. Port: ${SERIAL_PATH} @ ${BAUD_RATE} baud`);

async function sendHeartbeat(connected: boolean, rawPayload?: string) {
    try {
        await fetch(`${HONO_BASE}/api/status/hardware/heartbeat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                serialConnected: connected,
                lastDataTimestamp: new Date().toISOString(),
                rawPayload,
            }),
        });
    } catch (_) { }
}

async function sendDisconnect() {
    try {
        await fetch(`${HONO_BASE}/api/status/hardware/disconnect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });
    } catch (_) { }
}

async function handleLine(data: string) {
    console.log(`Menerima data dari USB: ${data}`);
    try {
        const response = await fetch(`${HONO_BASE}/api/environment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data,
        });

        if (response.ok) {
            console.log("Data berhasil diteruskan ke Hono Backend:", data);
        } else {
            console.error("Hono menolak data:", response.statusText);
        }
    } catch (error) {
        console.error("Gagal menghubungi Hono Backend:", error);
    }

    await sendHeartbeat(true, data);
}

let lineBuffer = "";

port.on('data', (chunk: Buffer) => {
    lineBuffer += chunk.toString('utf8');
    let index;
    while ((index = lineBuffer.indexOf('\n')) !== -1) {
        const line = lineBuffer.substring(0, index).trim();
        lineBuffer = lineBuffer.substring(index + 1);
        if (line) {
            handleLine(line);
        }
    }
});

port.on('open', () => {
    console.log(`Serial port ${SERIAL_PATH} terbuka.`);
    sendHeartbeat(true);
});

port.on('close', () => {
    console.log(`Serial port ${SERIAL_PATH} tertutup.`);
    sendDisconnect();
});

port.on('error', (err) => {
    console.error(`Serial port error: ${err.message}`);
    sendDisconnect();
});

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION:', reason);
});

setInterval(() => {}, 1000);