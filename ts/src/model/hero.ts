import { Buff } from "./buff";
import { HeroElement } from "./hero-element";

export class Hero {
  public buffs: Buff[] = [];

  constructor(
    public element: HeroElement,
    public pow: number,
    public def: number,
    public leth: number,
    public crtr: number,
    public lp: number) { }
  
  public switchElement(newElement: HeroElement) {
    this.element = newElement;
  }
}