import { describe } from "vitest";
import { LavkaStrategy } from "@/strategies";
import { loadAllTestCards } from "../__test_data__/loadTestData";
import { generalCardTest } from "@/strategies/__tests__/generalTest";

describe("LavkaStrategy", () => {
  const strategy = new LavkaStrategy();
  const testCards = loadAllTestCards("lavka");
  const currentCardTest = generalCardTest(strategy);
  testCards.forEach(currentCardTest);
});
