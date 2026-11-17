/* Sources (author-year style) and glossary for the VR voting simulation guide.
   s = short label. Sources are the pages the guide itself links to or credits,
   plus the Unreal Engine hardware page the guide refers readers to.
   Definitions were written for the site; each links to a reference page. */
window.REFS = {
  epicspecs: { s: "Epic Games", c: "Epic Games (n.d.). Hardware and software specifications for Unreal Engine. <i>Unreal Engine Documentation</i>.", url: "https://dev.epicgames.com/documentation/en-us/unreal-engine/hardware-and-software-specifications-for-unreal-engine" },
  prographers2022: { s: "Prographers 2022", c: "Juszczak, T. (2022). Unreal Engine: Foto-realistic rendering. <i>Prographers</i> (blog).", url: "https://prographers.com/blog/unreal-engine-foto-realistic-rendering" },
  lifewire: { s: "Lifewire", c: "Lifewire (n.d.). How to connect Meta Quest 2 to a PC. <i>Lifewire</i>.", url: "https://www.lifewire.com/vr-gaming-with-quest-2-wireless-pc-connection-8751238" },
  metacable: { s: "Meta Store", c: "Meta (n.d.). Quest Link Cable: connect PC to VR headset. <i>Meta Store</i>.", url: "https://www.meta.com/quest/accessories/link-cable/" },
  unityawards: { s: "Unity Awards", c: "Unity Technologies (n.d.). The 16th Unity Awards, Best AR/VR Game winner: <i>Assassin’s Creed Nexus VR</i> by Red Storm Entertainment | Ubisoft.", url: "https://unity.com/awards" },
  unrealdirective: { s: "Unreal Directive", c: "Unreal Directive (n.d.). Asset naming conventions. <i>Unreal Directive</i>.", url: "https://unrealdirective.com/resources/project-standards/asset-naming/" },
  epicnaming: { s: "Epic Games · naming", c: "Epic Games (n.d.). Recommended asset naming conventions in Unreal Engine projects. <i>Unreal Engine Documentation</i>.", url: "https://dev.epicgames.com/documentation/en-us/unreal-engine/recommended-asset-naming-conventions-in-unreal-engine-projects" },
  epicbpintro: { s: "Epic Games · Blueprints", c: "Epic Games (n.d.). Introduction to Blueprints visual scripting in Unreal Engine. <i>Unreal Engine Documentation</i>.", url: "https://dev.epicgames.com/documentation/en-us/unreal-engine/introduction-to-blueprints-visual-scripting-in-unreal-engine" },
  epicbpquick: { s: "Epic Games · Quick Start", c: "Epic Games (n.d.). Quick start guide for Blueprints visual scripting in Unreal Engine. <i>Unreal Engine Documentation</i>.", url: "https://dev.epicgames.com/documentation/en-us/unreal-engine/quick-start-guide-for-blueprints-visual-scripting-in-unreal-engine" },
  epicnodes: { s: "Epic Games · Nodes", c: "Epic Games (n.d.). Nodes in Unreal Engine. <i>Unreal Engine Documentation</i>.", url: "https://dev.epicgames.com/documentation/en-us/unreal-engine/nodes-in-unreal-engine" },
  epicbpbest: { s: "Epic Games · Best practices", c: "Epic Games (n.d.). Blueprint best practices in Unreal Engine. <i>Unreal Engine Documentation</i>.", url: "https://dev.epicgames.com/documentation/en-us/unreal-engine/blueprint-best-practices-in-unreal-engine" },
  unityvs: { s: "Unity Technologies", c: "Unity Technologies (n.d.). Unity Visual Scripting. <i>Unity</i>.", url: "https://unity.com/products/unity-visual-scripting" }
};

(function () {
  const W = t => "https://en.wikipedia.org/wiki/" + t;
  const E = t => "https://dev.epicgames.com/documentation/en-us/unreal-engine/" + t;
  const B = t => "https://docs.blender.org/manual/en/" + t;
  window.GLOSS = {
    /* the study */
    vr: { t: "Virtual reality (VR)", d: "A computer-generated 3D environment that surrounds the user. It is viewed through a headset that tracks head movement, so the scene responds as the real world would.", src: "Wikipedia", url: W("Virtual_reality") },
    immersion: { t: "Immersion", d: "The sense of being physically present inside a virtual environment, rather than looking at it on a screen.", src: "Wikipedia", url: W("Immersion_(virtual_reality)") },
    polling: { t: "Polling station", d: "The place where voters check in, mark and cast their ballots during an election; in the U.S. it is often a school gym or community hall.", src: "Wikipedia", url: W("Polling_place") },
    signage: { t: "Signage and wayfinding", d: "Signage is the set of signs placed in a space; wayfinding is how people orient themselves and choose a route through it. Good signage answers the question a visitor has at each decision point.", src: "Wikipedia", url: W("Wayfinding") },
    iconography: { t: "Iconography (pictograms)", d: "Simple pictorial symbols that convey a meaning at a glance, independent of language.", src: "Wikipedia", url: W("Pictogram") },

    /* engines */
    gameengine: { t: "Game engine", d: "A software framework for building interactive 3D applications. It handles rendering, physics, input and sound, so creators can focus on content.", src: "Wikipedia", url: W("Game_engine") },
    ue: { t: "Unreal Engine (UE)", d: "Epic Games’ real-time 3D engine. Version 5 (UE5) introduced Nanite and Lumen. This guide uses Unreal Engine 5.5.", src: "Wikipedia", url: W("Unreal_Engine") },
    unity: { t: "Unity", d: "A cross-platform game engine by Unity Technologies, scripted in C#; widely used for mobile and VR games.", src: "Wikipedia", url: W("Unity_(game_engine)") },
    csharp: { t: "C#", d: "A general-purpose programming language from Microsoft; Unity’s scripting language.", src: "Wikipedia", url: W("C_Sharp_(programming_language)") },
    cpp: { t: "C++", d: "A general-purpose, compiled programming language. Unreal Engine is written in it, and code-based Unreal projects use it.", src: "Wikipedia", url: W("C%2B%2B") },
    blueprints: { t: "Blueprints", d: "Unreal Engine’s visual scripting system: behavior is built by wiring nodes together on a graph instead of writing code.", src: "Epic docs", url: E("blueprints-visual-scripting-in-unreal-engine") },
    nanite: { t: "Nanite", d: "UE5’s virtualized geometry system. It streams and draws only as many triangles as the camera can resolve, so film-quality meshes run in real time.", src: "Epic docs", url: E("nanite-virtualized-geometry-in-unreal-engine") },
    lumen: { t: "Lumen", d: "UE5’s dynamic global illumination and reflections system. Lighting updates in real time when lights, objects or the time of day change.", src: "Epic docs", url: E("lumen-global-illumination-and-reflections-in-unreal-engine") },
    gi: { t: "Global illumination", d: "Lighting that includes light bounced from surface to surface, not only light that comes straight from a lamp or the sun.", src: "Wikipedia", url: W("Global_illumination") },
    baking: { t: "Baked lighting", d: "Lighting computed in advance and stored in textures (lightmaps). It is cheap to display but does not change when the scene changes.", src: "Wikipedia", url: W("Lightmap") },
    lod: { t: "Level of Detail (LOD)", d: "Simpler versions of a mesh that are swapped in as it moves away from the camera, to save rendering work.", src: "Wikipedia", url: W("Level_of_detail_(computer_graphics)") },

    /* 3D content */
    asset: { t: "Asset", d: "Any piece of content in a project: a 3D model, texture, material, sound or Blueprint.", src: "Epic docs", url: E("working-with-assets-in-unreal-engine") },
    mesh: { t: "Mesh", d: "The 3D surface of an object, made of vertices, edges and faces (polygons). The number of polygons is its poly count: more polygons give more detail but use more memory and GPU time.", src: "Wikipedia", url: W("Polygon_mesh") },
    texture: { t: "Texture", d: "An image wrapped onto a 3D surface to give it color and surface detail. Higher resolutions (such as 4K) use more memory.", src: "Wikipedia", url: W("Texture_mapping") },
    material: { t: "Material", d: "In Unreal Engine, the asset that defines how a surface looks (color, shine, roughness, textures). It is applied to a mesh through a material slot, listed as Element 0, Element 1 and so on.", src: "Epic docs", url: E("unreal-engine-materials") },
    staticmesh: { t: "Static mesh", d: "Unreal Engine’s basic, non-deforming 3D model (prefix SM_), used for props such as tables, voting booths and sign boards.", src: "Epic docs", url: E("static-meshes") },
    instancing: { t: "Instanced meshes", d: "One mesh drawn many times in a single request to the GPU, which makes repeated props such as rows of chairs cheap to render.", src: "Wikipedia", url: W("Geometry_instancing") },
    shader: { t: "Shader", d: "A small GPU program that works out how a surface is drawn. Unreal compiles a project’s shaders the first time it opens, which can take several minutes.", src: "Wikipedia", url: W("Shader") },
    glb: { t: "glTF / .glb", d: "The GL Transmission Format, an open 3D file format from the Khronos Group. A .glb file is its single-file binary form and carries meshes, materials and textures together.", src: "Wikipedia", url: W("GlTF") },
    blender: { t: "Blender", d: "Free, open-source 3D software for modeling, texturing, animation and rendering.", src: "Wikipedia", url: W("Blender_(software)") },
    transforms: { t: "Apply transforms", d: "In Blender, writing an object’s location, rotation and scale into its mesh, so it exports at the intended size and orientation.", src: "Blender manual", url: B("latest/scene_layout/object/editing/apply.html") },
    modifiers: { t: "Modifiers", d: "Blender operations (mirror, bevel, subdivision and others) that change a mesh without destroying the original until they are applied.", src: "Blender manual", url: B("latest/modeling/modifiers/introduction.html") },
    gltfexport: { t: "glTF 2.0 exporter", d: "Blender’s built-in exporter for .glb and .gltf files; its options include transform and modifier settings.", src: "Blender manual", url: B("4.1/addons/import_export/scene_gltf2.html") },
    fab: { t: "Fab", d: "Epic Games’ marketplace for 3D models, materials and other assets, free and paid, which replaced the Unreal Engine Marketplace.", src: "fab.com", url: "https://www.fab.com" },

    /* Unreal Editor */
    epiclauncher: { t: "Epic Games Launcher", d: "Epic’s desktop app for installing Unreal Engine versions, opening projects and adding Fab assets to them.", src: "Wikipedia", url: W("Epic_Games_Store") },
    uproject: { t: ".uproject file", d: "The small text file (in JSON format) that identifies an Unreal project. Double-clicking it opens the project; its EngineAssociation line names the engine version.", src: "Epic docs", url: E("unreal-engine-directory-structure") },
    viewport: { t: "Viewport", d: "The main 3D view in the Unreal Editor, where you look around the level and select objects.", src: "Epic docs", url: E("viewports-in-unreal-engine") },
    contentbrowser: { t: "Content Browser", d: "The Unreal Editor panel that lists every asset in the project by folder, for importing, searching and dragging into the level.", src: "Epic docs", url: E("content-browser-in-unreal-engine") },
    outliner: { t: "Outliner", d: "The Unreal Editor panel that lists every object (actor) placed in the level, as a searchable tree.", src: "Epic docs", url: E("outliner-in-unreal-engine") },
    details: { t: "Details panel", d: "The Unreal Editor panel showing the properties of the selected object: transform, mesh, materials, physics and more.", src: "Epic docs", url: E("level-editor-details-panel-in-unreal-engine") },
    gizmo: { t: "Transform gizmo", d: "The on-screen handles for moving (arrows), rotating (arcs) or scaling (cubes) the selected object along the X (red), Y (green) and Z (blue) axes.", src: "Epic docs", url: E("transforming-actors-in-unreal-engine") },
    vrpreview: { t: "VR Preview", d: "An Unreal Editor play mode that runs the level in the connected headset, without packaging the project first.", src: "Epic docs", url: E("play-in-editor-in-unreal-engine") },

    /* computer */
    cpu: { t: "CPU", d: "Central processing unit, the computer’s main processor. It runs the engine’s logic and prepares work for the GPU.", src: "Wikipedia", url: W("Central_processing_unit") },
    gpu: { t: "GPU", d: "Graphics processing unit (graphics card), the chip that renders the 3D images. It is the most important part for VR.", src: "Wikipedia", url: W("Graphics_processing_unit") },
    ram: { t: "RAM", d: "Random-access memory, the computer’s working memory. Large scenes and the editor itself need a lot of it.", src: "Wikipedia", url: W("Random-access_memory") },
    ssd: { t: "SSD", d: "Solid-state drive, fast flash storage that shortens the time to load projects and assets.", src: "Wikipedia", url: W("Solid-state_drive") },
    psu: { t: "Power supply unit (PSU)", d: "The part that powers the computer; a high-end GPU needs a PSU with enough wattage.", src: "Wikipedia", url: W("Power_supply_unit_(computer)") },
    driver: { t: "Driver", d: "Software that lets the operating system talk to a piece of hardware, such as the graphics card or the headset.", src: "Wikipedia", url: W("Device_driver") },
    geforce: { t: "NVIDIA app", d: "NVIDIA’s companion app that keeps GeForce graphics drivers up to date. It replaced GeForce Experience in 2024.", src: "NVIDIA", url: "https://www.nvidia.com/en-us/software/nvidia-app/" },
    steam: { t: "Steam", d: "Valve’s PC game platform and store, used here to install and run SteamVR.", src: "Wikipedia", url: W("Steam_(service)") },
    steamvr: { t: "SteamVR", d: "Valve’s VR runtime, installed through Steam; it connects many brands of headset to PC VR apps.", src: "Wikipedia", url: W("SteamVR") },
    openxr: { t: "OpenXR", d: "An open, royalty-free standard from the Khronos Group that lets one VR app run on headsets from different makers.", src: "Wikipedia", url: W("OpenXR") },
    sdk: { t: "SDK", d: "Software development kit: the libraries and tools a device maker provides so engines and apps can use its hardware. For Unreal Engine, Meta’s is the Meta XR Plugin (formerly the Oculus plugin).", src: "Wikipedia", url: W("Software_development_kit") },

    /* VR hardware */
    hmd: { t: "VR headset (HMD)", d: "A head-mounted display: screens and lenses in front of the eyes, plus sensors that track where the head is and where it is pointing.", src: "Wikipedia", url: W("Head-mounted_display") },
    quest: { t: "Meta Quest", d: "Meta’s line of standalone VR headsets (formerly Oculus Quest), including the Quest 2 and Quest 3. They have inside-out tracking and can run PC VR through Quest Link.", src: "Wikipedia", url: W("Meta_Quest") },
    touch: { t: "Touch controllers", d: "The Quest’s tracked hand controllers, each with a joystick, buttons, a trigger and a grip.", src: "Wikipedia", url: W("Oculus_Touch") },
    questlink: { t: "Quest Link", d: "Meta’s feature that runs PC VR apps on a Quest headset, over a USB cable (Link) or Wi-Fi (Air Link). The PC renders the images and the headset displays them.", src: "Lifewire", url: "https://www.lifewire.com/vr-gaming-with-quest-2-wireless-pc-connection-8751238" },
    boundary: { t: "Boundary (Guardian)", d: "The safe area you mark out on the floor in a Quest headset; the headset shows a wall when you get close to its edge. A stationary boundary is a small circle for seated use.", src: "Wikipedia", url: W("Meta_Quest") },
    sixdof: { t: "6DoF", d: "Six degrees of freedom: tracking of position (forward/back, up/down, left/right) and rotation (pitch, yaw, roll), so you can lean, crouch and walk in VR.", src: "Wikipedia", url: W("Six_degrees_of_freedom") },
    insideout: { t: "Inside-out tracking", d: "Cameras on the headset itself track its position against the room, so no external sensors are needed.", src: "Wikipedia", url: W("Inside-out_tracking") },
    outsidein: { t: "Outside-in tracking", d: "Sensors or base stations placed around the room track the headset and controllers from outside.", src: "Wikipedia", url: W("Positional_tracking") },
    fps: { t: "Frame rate (FPS)", d: "Frames drawn per second. VR needs about 90 or more, for each eye, for smooth and comfortable motion.", src: "Wikipedia", url: W("Frame_rate") },
    refresh: { t: "Refresh rate", d: "How many times per second a display redraws its image, in hertz (Hz).", src: "Wikipedia", url: W("Refresh_rate") },
    fov: { t: "Field of view (FoV)", d: "How much of the scene is visible at once, measured in degrees.", src: "Wikipedia", url: W("Field_of_view") },
    latency: { t: "Latency", d: "The delay between a movement and the matching change on screen. In VR, high latency breaks immersion and causes discomfort.", src: "Wikipedia", url: W("Latency_(engineering)") },
    vrsick: { t: "VR sickness", d: "Nausea, dizziness or eye strain caused by a mismatch between what the eyes see and what the body feels, often from lag or dropped frames.", src: "Wikipedia", url: W("Virtual_reality_sickness") },
    usb: { t: "USB 3.0 / USB-C", d: "USB 3.0 (and later) is the faster USB data standard, 5 Gbps and up; USB-C is the small, reversible connector. Quest Link needs both speed and a good cable.", src: "Wikipedia", url: W("USB-C") },
    gbps: { t: "Gbps", d: "Gigabits per second, a measure of data transfer speed.", src: "Wikipedia", url: W("Data-rate_units") },
    displayport: { t: "HDMI / DisplayPort", d: "Digital video connections from the graphics card to a monitor or a tethered headset.", src: "Wikipedia", url: W("DisplayPort") },

    /* planning */
    naming: { t: "Naming convention", d: "An agreed pattern for names, such as an SM_ prefix for every static mesh, that keeps files easy to find, sort and share.", src: "Wikipedia", url: W("Naming_convention_(programming)") },
    versioncontrol: { t: "Version control", d: "A system that records every change to a project’s files, so a team can work together and roll back mistakes.", src: "Wikipedia", url: W("Version_control") },
    mvp: { t: "Minimum viable product (MVP)", d: "The simplest version that meets the core goal; extra features are added only after it works.", src: "Wikipedia", url: W("Minimum_viable_product") },
    scopecreep: { t: "Scope creep", d: "The gradual growth of a project’s goals beyond the original plan, which costs time and focus.", src: "Wikipedia", url: W("Scope_creep") },
    illustrator: { t: "Adobe Illustrator", d: "A vector drawing program, useful for quick 2D floor plans.", src: "Wikipedia", url: W("Adobe_Illustrator") },
    figma: { t: "Figma", d: "A browser-based design tool for 2D layouts, with real-time collaboration.", src: "Wikipedia", url: W("Figma") },
    zip: { t: ".zip", d: "A compressed archive that packs a folder into a single, usually smaller, file.", src: "Wikipedia", url: W("ZIP_(file_format)") }
  };
})();
