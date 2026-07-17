import { SerialPort } from 'serialport';

const TARGET_PORT = 'COM5';
const BAUD_RATES = [9600, 19200, 38400, 57600, 74880, 115200];
const TEST_DURATION_MS = 5000;

console.log("=== BAUD RATE SCANNER ===");
console.log(`Port: ${TARGET_PORT}`);
console.log(`Testing: ${BAUD_RATES.join(', ')} baud`);
console.log(`Duration per rate: ${TEST_DURATION_MS / 1000}s`);
console.log("");

async function testBaudRate(baudRate: number): Promise<{ baudRate: number; bytes: number; chunks: number; sample: string }> {
    return new Promise((resolve) => {
        let totalBytes = 0;
        let chunkCount = 0;
        let sampleData = "";

        const port = new SerialPort({
            path: TARGET_PORT,
            baudRate,
            autoOpen: false,
        });

        port.on('data', (buffer: Buffer) => {
            chunkCount++;
            totalBytes += buffer.length;
            if (sampleData.length < 200) {
                sampleData += buffer.toString('ascii').replace(/[^\x20-\x7E\r\n]/g, '.');
            }
        });

        port.on('error', (err) => {
            console.log(`  [${baudRate}] ERROR: ${err.message}`);
            resolve({ baudRate, bytes: 0, chunks: 0, sample: "" });
        });

        port.open((err) => {
            if (err) {
                console.log(`  [${baudRate}] OPEN FAILED: ${err.message}`);
                resolve({ baudRate, bytes: 0, chunks: 0, sample: "" });
                return;
            }

            console.log(`  [${baudRate}] listening...`);

            setTimeout(() => {
                port.close(() => {
                    resolve({ baudRate, bytes: totalBytes, chunks: chunkCount, sample: sampleData.trim() });
                });
            }, TEST_DURATION_MS);
        });
    });
}

const results: { baudRate: number; bytes: number; chunks: number; sample: string }[] = [];

for (const rate of BAUD_RATES) {
    const result = await testBaudRate(rate);
    results.push(result);

    if (result.bytes > 0) {
        console.log(`  [${rate}] ${result.bytes} bytes / ${result.chunks} chunks`);
        console.log(`  [${rate}] SAMPLE: ${result.sample.substring(0, 120)}`);
    } else {
        console.log(`  [${rate}] 0 bytes`);
    }
    console.log("");

    await new Promise(r => setTimeout(r, 500));
}

console.log("=== RESULTS ===");
console.log("");

const hits = results.filter(r => r.bytes > 0);

if (hits.length === 0) {
    console.log("ZERO bytes on ALL baud rates.");
    console.log("");
    console.log("This means the ESP8266 is NOT transmitting at all.");
    console.log("Possible causes:");
    console.log("  1. Firmware not flashed (ESP8266 is blank)");
    console.log("  2. Firmware crashed or stuck in boot loop");
    console.log("  3. USB cable is charge-only (no data lines)");
    console.log("  4. TX/RX pins wired wrong (if using external FTDI)");
    console.log("  5. ESP8266 is in flash mode (GPIO0 pulled LOW)");
    console.log("");
    console.log("Try: Open Arduino IDE Serial Monitor on COM5 at 74880 baud");
    console.log("     and press the RST button on the ESP8266.");
    console.log("     You should see boot messages if the chip is alive.");
} else {
    console.log("DATA DETECTED on the following baud rates:");
    console.log("");
    for (const h of hits) {
        const isReadable = /[a-zA-Z0-9{}":]/.test(h.sample);
        console.log(`  ${h.baudRate} baud — ${h.bytes} bytes — ${isReadable ? "READABLE" : "GARBLED"}`);
        console.log(`    Sample: ${h.sample.substring(0, 100)}`);
        console.log("");
    }

    const best = hits.find(h => /[a-zA-Z0-9{}":]/.test(h.sample)) || hits[0];
    console.log(`RECOMMENDED: Use ${best.baudRate} baud in serial_bridge.ts`);
}
