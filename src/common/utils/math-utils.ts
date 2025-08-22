export namespace MathUtils {
  /**
   * Conversion factor from radians to degrees.
   * Multiply radians by this constant to get degrees.
   */
  export const RAD2DEG = 180 / Math.PI; // ~57.29578

  /**
   * Conversion factor from degrees to radians.
   * Multiply degrees by this constant to get radians.
   */
  export const DEG2RAD = Math.PI / 180; // ~0.01745329

  /**
   * Restricts a value between a minimum and maximum bound.
   * @param value The value to clamp.
   * @param min The minimum allowed value.
   * @param max The maximum allowed value.
   * @returns The clamped value within [min, max].
   */
  export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Performs linear interpolation between two values.
   * @param a Start value.
   * @param b End value.
   * @param t Interpolation factor in range [0, 1].
   * @returns Interpolated value between a and b.
   */
  export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /**
   * Converts an angle in radians to degrees.
   * @param rad Angle in radians.
   * @returns Equivalent angle in degrees.
   */
  export function rad2deg(rad: number): number {
    return rad * RAD2DEG;
  }

  /**
   * Converts an angle in degrees to radians.
   * @param deg Angle in degrees.
   * @returns Equivalent angle in radians.
   */
  export function deg2rad(deg: number): number {
    return deg * DEG2RAD;
  }

  /**
   * Maps a value from one range to another.
   * @param value The input value to map.
   * @param inMin Lower bound of the input range.
   * @param inMax Upper bound of the input range.
   * @param outMin Lower bound of the output range.
   * @param outMax Upper bound of the output range.
   * @returns The mapped value in the output range.
   */
  export function mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ): number {
    return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
  }

  /**
   * Normalizes a value to the range [0, 1].
   * @param value The value to normalize.
   * @param min Minimum bound of the input range.
   * @param max Maximum bound of the input range.
   * @returns Normalized value in range [0, 1].
   */
  export function normalize(value: number, min: number, max: number): number {
    return (value - min) / (max - min);
  }

  /**
   * Smoothly interpolates between two edges using a cubic Hermite curve.
   * Useful for smooth transitions (e.g. graphics, shaders).
   * @param edge0 Lower edge of the transition.
   * @param edge1 Upper edge of the transition.
   * @param x The input value to evaluate.
   * @returns Smoothed interpolation value in range [0, 1].
   */
  export function smoothstep(edge0: number, edge1: number, x: number): number {
    const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  /**
   * Generates a random number between min and max.
   * @param min Minimum value.
   * @param max Maximum value.
   * @returns Random number in range [min, max).
   */
  export function randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Checks if two numbers are approximately equal within a tolerance.
   * @param a First number.
   * @param b Second number.
   * @param epsilon Allowed tolerance (default: 1e-6).
   * @returns True if |a - b| < epsilon, otherwise false.
   */
  export function approxEqual(a: number, b: number, epsilon = 1e-6): boolean {
    return Math.abs(a - b) < epsilon;
  }
}