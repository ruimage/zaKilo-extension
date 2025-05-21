import { describe } from "vitest";
import { SamberiStrategy } from "@/strategies";
import { loadAllTestCards } from "../__test_data__/loadTestData";
import { generalCardTest } from "@/strategies/__tests__/generalTest";

describe("SamberiStrategy", () => {
  const strategy = new SamberiStrategy();
  const testCards = loadAllTestCards("samberi");
  const currentCardTest = generalCardTest(strategy);
  testCards.forEach(currentCardTest);
});
