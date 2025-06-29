import type { NoneUnitLabel, UnitLabel } from "@/types/IStrategy";

export class Money {
  constructor(
    private readonly amount: number,
    private readonly currency: string = "RUB",
  ) {
    if (amount < 0) {
      throw new Error("Money amount cannot be negative");
    }
  }

  get value(): number {
    return this.amount;
  }

  get currencyCode(): string {
    return this.currency;
  }

  per(quantity: Quantity): UnitPrice | null {
    if (!quantity.isValid()) return null;

    const standardValue = quantity.toStandardValue();
    if (standardValue === 0) return null;

    return new UnitPrice(this.amount * standardValue, quantity.getStandardUnit());
  }

  toString(): string {
    return `${this.amount} ${this.currency}`;
  }
}

export class Quantity {
  constructor(
    private readonly value: number,
    private readonly unit: string,
  ) {}

  static fromUnitLabel(unitLabel: UnitLabel | NoneUnitLabel): Quantity {
    if (!unitLabel.unitLabel || !unitLabel.multiplier) {
      return new Quantity(0, "unknown");
    }

    return new Quantity(unitLabel.multiplier, unitLabel.unitLabel);
  }

  isValid(): boolean {
    return this.value > 0 && this.unit !== "unknown";
  }

  toStandardValue(): number {
    // Convert to standard units based on multiplier
    return this.value;
  }

  getStandardUnit(): string {
    return this.unit;
  }

  toString(): string {
    return `${this.value} ${this.unit}`;
  }
}

export class UnitPrice {
  constructor(
    private readonly pricePerUnit: number,
    private readonly unit: string,
  ) {}

  get value(): number {
    return this.pricePerUnit;
  }

  get unitType(): string {
    return this.unit;
  }

  toString(): string {
    return `${Math.round(this.pricePerUnit)} ₽ за ${this.unit}`;
  }
}

export class Product {
  constructor(
    private readonly price: Money,
    private readonly quantity: Quantity,
    private readonly name: string,
    private readonly id?: string,
  ) {}

  get productName(): string {
    return this.name;
  }

  get totalPrice(): Money {
    return this.price;
  }

  get productQuantity(): Quantity {
    return this.quantity;
  }

  get productId(): string | undefined {
    return this.id;
  }

  calculateUnitPrice(): UnitPrice | null {
    return this.price.per(this.quantity);
  }

  hasValidPricing(): boolean {
    return this.price.value > 0 && this.quantity.isValid();
  }

  toString(): string {
    const unitPrice = this.calculateUnitPrice();
    return `${this.name}: ${this.price} (${unitPrice?.toString() || "Нет инф."})`;
  }
}
