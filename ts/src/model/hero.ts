import { Buff } from "./buff";
import { HeroElement } from "./hero-element";

export class Hero {
  public buffs: Buff[] = [];

  constructor(readonly element: HeroElement, readonly pow: number, readonly def: number, readonly leth: number, readonly crtr: number, public lp: number) {
  }
}