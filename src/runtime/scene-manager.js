/**
 * Scene Manager
 * Multi-scene support for large applications
 */

import { ScrollScriptCore } from '../script/core.js';

export class SceneManager {
  constructor() {
    this.scenes = new Map();
    this.activeScene = null;
  }

  /**
   * Create a new scene
   */
  createScene(name, config = {}) {
    if (this.scenes.has(name)) {
      throw new Error(`Scene '${name}' already exists`);
    }

    const scene = {
      name,
      script: new ScrollScriptCore(config),
      components: new Map(),
      active: false,
      metadata: config.metadata || {}
    };

    this.scenes.set(name, scene);

    console.log(`[SceneManager] Scene created: ${name}`);

    return scene;
  }

  /**
   * Switch to scene
   */
  switchTo(name) {
    const scene = this.scenes.get(name);
    if (!scene) {
      throw new Error(`Scene '${name}' not found`);
    }

    // Deactivate current
    if (this.activeScene) {
      this.activeScene.active = false;
    }

    // Activate new
    scene.active = true;
    this.activeScene = scene;

    console.log(`[SceneManager] Switched to: ${name}`);

    return scene;
  }

  /**
   * Get scene
   */
  getScene(name) {
    return this.scenes.get(name);
  }

  /**
   * Delete scene
   */
  deleteScene(name) {
    const scene = this.scenes.get(name);
    if (!scene) return;

    // Cleanup
    scene.script.reset();
    scene.components.clear();

    this.scenes.delete(name);

    if (this.activeScene === scene) {
      this.activeScene = null;
    }

    console.log(`[SceneManager] Scene deleted: ${name}`);
  }

  /**
   * Share signal between scenes
   */
  shareSignal(signalName, ...sceneNames) {
    const scenes = sceneNames.map(name => this.scenes.get(name)).filter(Boolean);
    
    if (scenes.length < 2) return;

    // Create shared signal in first scene
    const primaryScene = scenes[0];
    
    if (!primaryScene.script.getSignal(signalName)) {
      throw new Error(`Signal '${signalName}' not found in scene '${primaryScene.name}'`);
    }

    // Watch in primary, update others
    primaryScene.script.watch(signalName, (value) => {
      scenes.slice(1).forEach(scene => {
        if (scene.script.getSignal(signalName)) {
          scene.script.set(signalName, value);
        }
      });
    });

    console.log(`[SceneManager] Signal '${signalName}' shared across ${scenes.length} scenes`);
  }

  /**
   * Get all scenes
   */
  getScenes() {
    return Array.from(this.scenes.keys());
  }

  /**
   * Get active scene
   */
  getActive() {
    return this.activeScene;
  }
}

export const globalSceneManager = new SceneManager();

export function createScene(name, config) {
  return globalSceneManager.createScene(name, config);
}

export function switchScene(name) {
  return globalSceneManager.switchTo(name);
}

