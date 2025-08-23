export namespace VectorUtils {
    export function intersectRayPlane(
		origin: [number, number, number],
		direction: [number, number, number],
    	planeNormal: [number, number, number],
    	planeOrigin: [number, number, number],
	): number | null {
    	const value = dot(planeNormal, direction);

    	if(isParallel(value)) return null;

    	const diff = subtract(planeOrigin, origin);
		const t = dot(diff, planeNormal) / value;
    	return t >= 0 ? t : null;
	}

	export function isParallel(dot: number, epsilon = 1e-6): boolean {
		return Math.abs(dot) < epsilon ? true :  false;
	}

	export function dot(a: [number, number, number], b: [number, number, number]): number {
    	return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  	}

	export function subtract(a: [number, number, number], b: [number, number, number]): [number, number, number] {
		return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
	}

	export function scaleAndAdd(a: [number, number, number], b: [number, number, number], scale: number): [number, number, number] {
    	return [a[0] + b[0] * scale, a[1] + b[1] * scale, a[2] + b[2] * scale];
	}
}