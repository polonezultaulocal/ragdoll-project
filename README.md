# Three.js Robot Arm Demo – Work in Progress

This project is an experimental implementation using Three.js, showcasing a rigged 3D robot model with skeletal animation and HDR environment mapping. The purpose is to explore the interaction between a model's skeleton, its animations, and realistic lighting, while progressively refining the visual and interactive aspects.  

---

## Overview

The demo loads a GLTF robot model that includes a full skeletal rig. Each bone in the skeleton can be identified by hovering over it, giving insight into how the skeleton drives the movement of the mesh. This approach allows for interactive examination of the model's hierarchical structure and serves as a foundation for more advanced animations.

The right arm of the robot can perform a simple waving motion, controlled via a toggle button. While currently basic, this demonstrates how bone rotations propagate through the skeletal hierarchy to produce visible movements on the model. The animation parameters are implemented to illustrate real-time manipulation of the skeleton and will be refined to appear smoother and more natural in future updates.

---

## Skeleton Interaction

A significant aspect of this demo is the interactive skeleton highlighting. Invisible meshes are aligned along each bone, allowing raycasting to detect mouse interactions. When the cursor hovers over a bone, its name is displayed on the screen. This system provides immediate feedback on the structure of the skeleton and illustrates how individual bones contribute to the model's movement. It also serves as a foundation for more complex interactions, such as procedural animation or user-controlled manipulation.

---

## Notes

This is very much a **work in progress**. The current implementation focuses on establishing the core systems: loading the model, displaying the skeleton, applying textures with HDR lighting, and performing basic animations. These systems will be gradually fine-tuned to improve visual quality, animation smoothness, and interactivity.  

The project requires a modern browser with WebGL2 support, and the HDR and GLTF assets need to be correctly located in the `public/` folder for proper loading.

---

## Future Directions

Planned improvements include:

- Creating more fluid and complex skeletal animations for the robot, including multiple gestures and sequences.  
- Enhancing material properties and texture mapping to better respond to environmental lighting.  
- Expanding the interactivity of the skeleton, allowing more detailed exploration of the model's rig.  
- Optimizing performance and rendering quality, potentially incorporating advanced shaders for better visual effects.

This project is an ongoing learning experience, and updates will continue to push the capabilities of the model, animation system, and environment rendering.
