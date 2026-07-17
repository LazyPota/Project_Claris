export type HardwareStatus = "ONLINE" | "SYNCING" | "OFFLINE";

interface HardwareState {
  connected: boolean;
  lastHeartbeat: number;
  lastPayload: string | null;
}

const SYNCING_THRESHOLD_MS = 5000;
const OFFLINE_THRESHOLD_MS = 15000;

const state: HardwareState = {
  connected: false,
  lastHeartbeat: 0,
  lastPayload: null,
};

export class HardwareStatusService {
  static recordHeartbeat(connected: boolean, payload?: string) {
    state.connected = connected;
    state.lastHeartbeat = Date.now();
    if (payload !== undefined) {
      state.lastPayload = payload;
    }
  }

  static recordDisconnect() {
    state.connected = false;
  }

  static getStatus(): {
    status: HardwareStatus;
    connected: boolean;
    lastHeartbeat: number;
    lastPayload: string | null;
    staleDurationMs: number;
  } {
    const now = Date.now();
    const staleDurationMs = state.lastHeartbeat > 0 ? now - state.lastHeartbeat : -1;
    let status: HardwareStatus = "OFFLINE";

    if (!state.connected || state.lastHeartbeat === 0) {
      status = "OFFLINE";
    } else if (staleDurationMs > OFFLINE_THRESHOLD_MS) {
      status = "OFFLINE";
    } else if (staleDurationMs > SYNCING_THRESHOLD_MS) {
      status = "SYNCING";
    } else {
      status = "ONLINE";
    }

    return {
      status,
      connected: state.connected,
      lastHeartbeat: state.lastHeartbeat,
      lastPayload: state.lastPayload,
      staleDurationMs,
    };
  }
}
