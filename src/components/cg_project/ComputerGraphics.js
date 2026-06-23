// ComputerGraphics.js
// Showcase for the DTU 02561 Computer Graphics worksheets.
//
// Worksheet 01 is rendered inline as React components (they drive a <canvas>
// via the ES-module helpers in src/utils). Worksheets 02-10 are the original
// Angel-style standalone HTML pages, served as static files from
// public/cg_project/ and embedded in lazy-loaded iframes. Only one worksheet is
// expanded at a time so stale WebGL contexts are torn down on collapse.
import React, { useState } from "react";
import LazyLoadIframe from "../LazyLoadIframe";
import W01P1 from "./01/w01p1";
import W01P2 from "./01/w01p2";
import W01P3 from "./01/w01p3";
import W01P4 from "./01/w01p4";
import W01P5 from "./01/w01p5";

const DEMO_HEIGHT = 600;

// Each worksheet: { id, title, summary, pdf?, parts: [{ label, node | file }] }
// `file` is resolved to /cg_project/<id>/<file>.html (served from public/).
const worksheets = [
  {
    id: "01",
    title: "WebGL Fundamentals",
    summary:
      "Setting up a WebGL context, compiling shaders, uploading vertex buffers, and drawing and animating basic primitives.",
    parts: [
      { label: "Initializing a WebGL context", node: <W01P1 /> },
      { label: "Drawing points", node: <W01P2 /> },
      { label: "Drawing a triangle", node: <W01P3 /> },
      { label: "A rotating triangle", node: <W01P4 /> },
      { label: "An animated triangle fan", node: <W01P5 /> },
    ],
  },
  {
    id: "02",
    title: "Primitives & Interaction",
    summary:
      "Rendering primitives and handling mouse input — adding points and shapes to the canvas interactively.",
    parts: [
      { label: "Click to add points", file: "w02p1" },
      { label: "Points with colour selection", file: "w02p2" },
      { label: "Part 3", file: "w02p3" },
      { label: "Part 4", file: "w02p4" },
    ],
  },
  {
    id: "03",
    title: "2D Transformations & Animation",
    summary:
      "Applying translation, rotation and scaling, and animating geometry over time.",
    parts: [
      { label: "Part 1", file: "w03p1" },
      { label: "Part 2", file: "w03p2" },
      { label: "Part 3", file: "w03p3" },
      { label: "Part 4", file: "w03p4" },
    ],
  },
  {
    id: "04",
    title: "3D Viewing & Shading",
    summary:
      "Spheres, the depth buffer and back-face culling, perspective projection, and Gouraud vs. Phong shading.",
    parts: [
      { label: "Part 1", file: "w04p1" },
      { label: "Sphere with depth buffer & back-face culling", file: "w04p2" },
      { label: "Gouraud-shaded sphere with lighting", file: "w04p3" },
      { label: "Phong-shaded sphere", file: "w04p4" },
      { label: "Phong-shaded sphere with controls", file: "w04p5" },
    ],
  },
  {
    id: "05",
    title: "3D Models",
    summary:
      "Loading and shading triangle meshes from OBJ files (the Blender “Suzanne” monkey model).",
    pdf: "02561-worksheet05.pdf",
    parts: [
      { label: "Load and display the model", file: "w05p3" },
      { label: "Phong shading on the model", file: "w05p4" },
    ],
  },
  {
    id: "06",
    title: "Texture Mapping",
    summary:
      "Image textures with different wrapping and filtering modes, including a textured Earth.",
    pdf: "02561-worksheet06.pdf",
    parts: [
      { label: "Part 1", file: "w06p1" },
      { label: "Texture wrapping & filtering modes", file: "w06p2" },
      { label: "Textured Earth with orbiting camera", file: "w06p3" },
      { label: "Part 4", file: "w06p4" },
    ],
  },
  {
    id: "07",
    title: "Environment Mapping",
    summary:
      "Cube maps for reflective surfaces and skyboxes, combined with normal mapping.",
    pdf: "02561-worksheet07.pdf",
    parts: [
      { label: "Part 1", file: "w07p1" },
      { label: "Part 2", file: "w07p2" },
      { label: "Part 3", file: "w07p3" },
      { label: "Part 4", file: "w07p4" },
    ],
  },
  {
    id: "08",
    title: "Shadows",
    summary:
      "Casting shadows onto a ground plane using projection shadows and shadow-polygon culling.",
    pdf: "02561-worksheet08.pdf",
    parts: [
      { label: "Simple shadows", file: "w08p1" },
      { label: "Projection shadows", file: "w08p2" },
      { label: "Shadow polygon culling", file: "w08p3" },
      { label: "Part 4", file: "w08p4" },
    ],
  },
  {
    id: "09",
    title: "Lighting & Shadow Mapping",
    summary:
      "A Phong-shaded teapot on a textured ground with a moving light, and several shadow-mapping techniques.",
    pdf: "02561-worksheet09.pdf",
    parts: [
      { label: "Teapot and textured ground", file: "w09p1" },
      { label: "Teapot and textured ground (II)", file: "w09p2" },
      { label: "Shadow mapping", file: "w09p3" },
      { label: "8-bit precision shadow mapping", file: "w09p4" },
      { label: "Projection shadows vs. shadow mapping", file: "w09p5" },
      { label: "Improved-precision shadow mapping (a)", file: "w09p6a" },
      { label: "Improved-precision shadow mapping (b)", file: "w09p6b" },
    ],
  },
  {
    id: "10",
    title: "Quaternions & Virtual Trackball",
    summary:
      "Rotating and manipulating an object interactively with quaternions and an arcball-style virtual trackball.",
    pdf: "02561-worksheet10.pdf",
    parts: [
      { label: "Part 1", file: "w10p1" },
      { label: "Part 2", file: "w10p2" },
      { label: "Part 3", file: "w10p3" },
      { label: "Part 4", file: "w10p4" },
    ],
  },
];

const Demo = ({ part, worksheetId }) => (
  <div className="mb-8 last:mb-0">
    <h4 className="text-base font-medium text-gray-800 mb-3">{part.label}</h4>
    <div className="max-w-2xl mx-auto">
      {part.node ? (
        <div className="flex justify-center bg-gray-50 rounded-xl p-4">
          {part.node}
        </div>
      ) : (
        <LazyLoadIframe
          src={`/cg_project/${worksheetId}/${part.file}.html`}
          title={`${worksheetId} ${part.label}`}
          width="100%"
          height={DEMO_HEIGHT}
          frameBorder="0"
        />
      )}
    </div>
  </div>
);

const Chevron = ({ open }) => (
  <svg
    className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
      open ? "rotate-90" : ""
    }`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

const ComputerGraphics = () => {
  // Single-open accordion; first worksheet open by default.
  const [openId, setOpenId] = useState("01");

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-semibold mb-2">
        Computer Graphics
      </h2>
      <p className="text-gray-700 mb-8 max-w-3xl">
        Interactive WebGL exercises from DTU course 02561, progressing from the
        basics of the graphics pipeline through 3D models, texturing, lighting,
        shadows and interactive camera control. Expand a worksheet to run its
        demos live in the browser.
      </p>

      <div className="space-y-3">
        {worksheets.map((ws) => {
          const open = openId === ws.id;
          return (
            <div
              key={ws.id}
              className="border border-gray-200 rounded-xl overflow-hidden bg-white"
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : ws.id)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition"
                aria-expanded={open}
              >
                <Chevron open={open} />
                <span className="text-xs font-semibold text-gray-400 tabular-nums">
                  {ws.id}
                </span>
                <span className="flex-1">
                  <span className="block font-semibold text-gray-900">
                    {ws.title}
                  </span>
                  <span className="block text-sm text-gray-500">
                    {ws.summary}
                  </span>
                </span>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {ws.parts.length} {ws.parts.length === 1 ? "demo" : "demos"}
                </span>
              </button>

              {open && (
                <div className="px-5 pb-6 pt-2 border-t border-gray-100">
                  {ws.pdf && (
                    <a
                      href={`/cg_project/${ws.id}/${ws.pdf}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-6"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Worksheet PDF
                    </a>
                  )}
                  {ws.parts.map((part, i) => (
                    <Demo key={i} part={part} worksheetId={ws.id} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComputerGraphics;
