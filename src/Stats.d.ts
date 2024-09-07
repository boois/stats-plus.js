import { Scene,WebGLRenderer } from "three";

export default class Stats {
    constructor(scene: Scene, renderer: WebGLRenderer);
    showPanel(panel: number): void;
    begin(): void;
    end(): void;
    dom: HTMLElement;
}