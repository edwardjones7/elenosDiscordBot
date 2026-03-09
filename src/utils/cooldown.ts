import { Collection } from 'discord.js';

export class CooldownManager {
  private cooldowns: Collection<string, Collection<string, number>>;

  constructor(cooldowns: Collection<string, Collection<string, number>>) {
    this.cooldowns = cooldowns;
  }

  check(commandName: string, userId: string, cooldownSeconds: number): { onCooldown: boolean; remainingMs: number } {
    if (!this.cooldowns.has(commandName)) {
      this.cooldowns.set(commandName, new Collection());
    }

    const now = Date.now();
    const timestamps = this.cooldowns.get(commandName)!;
    const cooldownMs = cooldownSeconds * 1000;

    if (timestamps.has(userId)) {
      const expiry = timestamps.get(userId)! + cooldownMs;
      if (now < expiry) {
        return { onCooldown: true, remainingMs: expiry - now };
      }
    }

    return { onCooldown: false, remainingMs: 0 };
  }

  set(commandName: string, userId: string): void {
    if (!this.cooldowns.has(commandName)) {
      this.cooldowns.set(commandName, new Collection());
    }
    this.cooldowns.get(commandName)!.set(userId, Date.now());
  }
}
