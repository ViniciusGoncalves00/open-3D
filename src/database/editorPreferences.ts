import { ObservableField } from "../common/observer/observable-field";

export class EditorPreferences {
    public panButtons: ObservableField<Set<number>> = new ObservableField(new Set([0]));
    public orbitButtons: ObservableField<Set<number>> = new ObservableField(new Set([1]));
    public rotateButtons: ObservableField<Set<number>> = new ObservableField(new Set([2]));

    // #region [direction]
    public readonly xPanDirection: ObservableField<number> = new ObservableField(1);
    public readonly yPanDirection: ObservableField<number> = new ObservableField(1);

    public readonly yawRotateDirection: ObservableField<number> = new ObservableField(-1);
    public readonly pitchRotateDirection: ObservableField<number> = new ObservableField(1);

    public readonly yawOrbitDirection: ObservableField<number> = new ObservableField(-1);
    public readonly pitchOrbitDirection: ObservableField<number> = new ObservableField(1);

    public readonly zoomDirection: ObservableField<number> = new ObservableField(-1);
    // #endregion

    // #region [sensivity]
    public readonly xPanSensivity: ObservableField<number> = new ObservableField(0.01);
    public readonly yPanSensivity: ObservableField<number> = new ObservableField(0.01);

    public readonly pitchRotateSensivity: ObservableField<number> = new ObservableField(0.1);
    public readonly yawRotateSensivity: ObservableField<number> = new ObservableField(0.1);

    public readonly pitchOrbitSensivity: ObservableField<number> = new ObservableField(0.01);
    public readonly yawOrbitSensivity: ObservableField<number> = new ObservableField(0.01);

    public readonly zoomSensivity: ObservableField<number> = new ObservableField(0.01);
    // #endregion

    // #region [smoothness]
    public readonly orbitSmoothness: ObservableField<number> = new ObservableField(1);
    // #endregion

    public static fromJSON(data: any): EditorPreferences {
        const handler = new EditorPreferences();

        handler.panButtons.value = new Set(data.panButtons ?? [0]);
        handler.orbitButtons.value = new Set(data.orbitButtons ?? [1]);
        handler.rotateButtons.value = new Set(data.rotateButtons ?? [2]);

        handler.xPanDirection.value = data.xPanDirection ?? 1;
        handler.yPanDirection.value = data.yPanDirection ?? 1;
        handler.yawRotateDirection.value = data.yawRotateDirection ?? -1;
        handler.pitchRotateDirection.value = data.pitchRotateDirection ?? 1;
        handler.yawOrbitDirection.value = data.yawOrbitDirection ?? -1;
        handler.pitchOrbitDirection.value = data.pitchOrbitDirection ?? 1;
        handler.zoomDirection.value = data.zoomDirection ?? -1;

        handler.xPanSensivity.value = data.xPanSensivity ?? 0.01;
        handler.yPanSensivity.value = data.yPanSensivity ?? 0.01;
        handler.pitchRotateSensivity.value = data.pitchRotateSensivity ?? 0.1;
        handler.yawRotateSensivity.value = data.yawRotateSensivity ?? 0.1;
        handler.pitchOrbitSensivity.value = data.pitchOrbitSensivity ?? 0.01;
        handler.yawOrbitSensivity.value = data.yawOrbitSensivity ?? 0.01;
        handler.zoomSensivity.value = data.zoomSensivity ?? 0.01;

        handler.orbitSmoothness.value = data.orbitSmoothness ?? 1;
        return handler;
    }

    public toJSON(): Object {
        return {
            panButtons: Array.from(this.panButtons.value),
            orbitButtons: Array.from(this.orbitButtons.value),
            rotateButtons: Array.from(this.rotateButtons.value),

            xPanDirection: this.xPanDirection.value,
            yPanDirection: this.yPanDirection.value,
            yawRotateDirection: this.yawRotateDirection.value,
            pitchRotateDirection: this.pitchRotateDirection.value,
            yawOrbitDirection: this.yawOrbitDirection.value,
            pitchOrbitDirection: this.pitchOrbitDirection.value,
            zoomDirection: this.zoomDirection.value,

            xPanSensivity: this.xPanSensivity.value,
            yPanSensivity: this.yPanSensivity.value,
            pitchRotateSensivity: this.pitchRotateSensivity.value,
            yawRotateSensivity: this.yawRotateSensivity.value,
            pitchOrbitSensivity: this.pitchOrbitSensivity.value,
            yawOrbitSensivity: this.yawOrbitSensivity.value,
            zoomSensivity: this.zoomSensivity.value,

            orbitSmoothness: this.orbitSmoothness.value,
        };
    }
}