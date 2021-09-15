export class ProgramUtils {
  static LAMPS = 1000_000_000;

  static solToLamports(sol: number) {
    return sol * ProgramUtils.LAMPS;
  }

  static lamportsToSol(lapms: number) {
    return lapms / ProgramUtils.LAMPS;
  }
}
