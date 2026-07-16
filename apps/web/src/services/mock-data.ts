import type {
  EnvironmentData,
  HarvestRecord,
  FeedingEvent,
} from "@/types/models";

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getEnvironmentData(): Promise<EnvironmentData> {
  await delay();

  return {
    dissolvedOxygen: 6.8,
    pH: 7.4,
    waterLevel: 1.35,
    temperature: 29.2,
    hasAlert: false,
    timestamp: new Date().toISOString(),
  };
}

export async function getHarvestStats(): Promise<HarvestRecord[]> {
  await delay();

  return [
    {
      date: "2026-07-01",
      estimatedBiomassKg: 1250,
      actualYieldKg: 1180,
      pondId: "P-01",
      species: "Clarias gariepinus",
    },
    {
      date: "2026-06-15",
      estimatedBiomassKg: 980,
      actualYieldKg: 935,
      pondId: "P-02",
      species: "Clarias gariepinus",
    },
    {
      date: "2026-06-01",
      estimatedBiomassKg: 1100,
      actualYieldKg: 1045,
      pondId: "P-01",
      species: "Clarias gariepinus",
    },
    {
      date: "2026-05-15",
      estimatedBiomassKg: 870,
      actualYieldKg: 820,
      pondId: "P-03",
      species: "Oreochromis niloticus",
    },
    {
      date: "2026-05-01",
      estimatedBiomassKg: 1320,
      actualYieldKg: 1290,
      pondId: "P-01",
      species: "Clarias gariepinus",
    },
  ];
}

export async function getFeedingHistory(): Promise<FeedingEvent[]> {
  await delay();

  return [
    {
      date: "2026-07-16T06:00:00Z",
      feedType: "Hi-Pro-Vite 781-2",
      amountKg: 45,
      pondId: "P-01",
    },
    {
      date: "2026-07-16T06:00:00Z",
      feedType: "Hi-Pro-Vite 781-2",
      amountKg: 38,
      pondId: "P-02",
    },
    {
      date: "2026-07-15T17:00:00Z",
      feedType: "PF-1000",
      amountKg: 42,
      pondId: "P-01",
    },
    {
      date: "2026-07-15T17:00:00Z",
      feedType: "PF-1000",
      amountKg: 35,
      pondId: "P-02",
    },
    {
      date: "2026-07-15T06:00:00Z",
      feedType: "Hi-Pro-Vite 781-2",
      amountKg: 44,
      pondId: "P-01",
    },
    {
      date: "2026-07-14T17:00:00Z",
      feedType: "PF-1000",
      amountKg: 40,
      pondId: "P-03",
    },
    {
      date: "2026-07-14T06:00:00Z",
      feedType: "Hi-Pro-Vite 781-2",
      amountKg: 30,
      pondId: "P-03",
    },
  ];
}
