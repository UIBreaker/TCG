import { Card } from './card';

export interface Chest {
  id: string;
  isMimic: boolean;
  hasLightHint: boolean;
  isOpened: boolean;
}

export interface ChestResult {
  success: boolean;
  isTrap: boolean;
  isMimic: boolean;
  goldGained: number;
  cardReward?: Card;
  trapDamageToTeam?: number;
  message: string;
}
