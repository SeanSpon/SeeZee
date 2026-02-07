"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FiCpu,
  FiGitPullRequest,
  FiTerminal,
  FiExternalLink,
  FiAlertTriangle,
  FiX,
  FiRefreshCw,
  FiMap,
  FiActivity,
  FiBox,
  FiArrowLeft,
  FiZoomIn,
  FiZoomOut,
  FiMaximize,
} from "react-icons/fi";

// ==========================================
// Types (matching existing API responses)
// ==========================================

interface NodeRun {
  id: string;
  status: "RUNNING" | "DONE" | "FAILED" | "NEEDS_ANSWER";
  prUrl: string | null;
  previewUrl: string | null;
  branchName: string;
  startedAt: string;
  completedAt: string | null;
}

interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  url: string;
  cloneUrl: string;
  description: string | null;
  language: string | null;
  isPrivate: boolean;
  defaultBranch: string;
  pushedAt: string;
  updatedAt: string;
}

interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  status: "ONLINE" | "BUSY" | "OFFLINE" | "ERROR";
  capabilities: Record<string, boolean>;
  metadata: Record<string, unknown>;
  lastHeartbeatAt: string | null;
  currentJobId: string | null;
  totalRuns: number;
  recentRuns: NodeRun[];
  createdAt: string;
}

interface RunDetail {
  id: string;
  status: string;
  branchName: string;
  prUrl: string | null;
  previewUrl: string | null;
  errorMessage: string | null;
  summary: string | null;
  questions: unknown;
  answers: unknown;
  startedAt: string;
  completedAt: string | null;
  logCount: number;
  node: { id: string; name: string; type: string };
  request: {
    id: string;
    repoUrl: string;
    branchName: string;
    priority: string;
    status: string;
    todo: {
      id: string;
      title: string;
      description: string | null;
      status: string;
      priority: string;
    };
  };
}

// ==========================================
// Position helpers — deterministic grid
// ==========================================

const GRID_COLS = 20;
const GRID_ROWS = 14;
const CELL_W = 90;
const CELL_H = 80;

const MAP_WIDTH = GRID_COLS * CELL_W;
const MAP_HEIGHT = GRID_ROWS * CELL_H;

// Depot sits at street intersection row=11, col=1
const DEPOT = { col: 1, row: 11 };
// Return bay at far east side row=11, col=18
const RETURN_BAY = { col: 18, row: 11 };

// Street row/col positions for snapping buses
const STREET_H_ROWS = [2, 5, 8, 11];
const STREET_V_COLS = [2, 5, 8, 11, 14, 17];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleSeeded<T>(arr: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Define commercial zones (areas between streets where buildings can be placed)
// These are non-residential zones that won't conflict with houses
const COMMERCIAL_ZONES = (() => {
  const zones: Array<{ col: number; row: number }> = [];
  
  // Create a grid of commercial slots between streets
  // We'll use positions that are centered in blocks, away from residential edges
  for (let ri = 0; ri < STREET_H_ROWS.length - 1; ri++) {
    for (let ci = 0; ci < STREET_V_COLS.length - 1; ci++) {
      const r1 = STREET_H_ROWS[ri];
      const r2 = STREET_H_ROWS[ri + 1];
      const c1 = STREET_V_COLS[ci];
      const c2 = STREET_V_COLS[ci + 1];
      
      // Calculate center of this commercial block
      const centerRow = Math.floor((r1 + r2) / 2);
      const centerCol = Math.floor((c1 + c2) / 2);
      
      // Add multiple slots per block for larger commercial areas
      zones.push({ col: centerCol, row: centerRow });
      
      // Add offset positions for variety (if block is large enough)
      if (c2 - c1 > 3) {
        zones.push({ col: centerCol - 1, row: centerRow });
        zones.push({ col: centerCol + 1, row: centerRow });
      }
      if (r2 - r1 > 3) {
        zones.push({ col: centerCol, row: centerRow - 1 });
        zones.push({ col: centerCol, row: centerRow + 1 });
      }
    }
  }
  
  return zones;
})();

// Place buildings in commercial zones with even distribution
function buildingPosition(repoUrl: string, index: number): { col: number; row: number } {
  // Use modulo to cycle through available commercial zones
  const zoneIndex = index % COMMERCIAL_ZONES.length;
  const zone = COMMERCIAL_ZONES[zoneIndex];
  
  // Add slight variation based on repo hash to avoid perfect grid
  const h = hashString(repoUrl);
  const offsetCol = ((h % 5) - 2) * 0.3; // Small offset -0.6 to +0.6
  const offsetRow = (((h >> 4) % 5) - 2) * 0.3;
  
  return {
    col: zone.col + offsetCol,
    row: zone.row + offsetRow,
  };
}

// ==========================================
// Procedural City Generation
// ==========================================

interface CityBldg {
  x: number; y: number; w: number; h: number;
  color: string; winAlpha: number; antenna: boolean;
}

interface CityBlock {
  x: number; y: number; w: number; h: number;
  kind: "buildings" | "park" | "plaza" | "water";
  bldgs: CityBldg[];
  trees: Array<{ x: number; y: number; v: number }>;
}

interface CityStreet {
  x: number; y: number; w: number; h: number;
  horiz: boolean; main: boolean;
}

interface CityData {
  streets: CityStreet[];
  blocks: CityBlock[];
  lamps: Array<{ x: number; y: number }>;
}

function generateCity(): CityData {
  const rng = mulberry32(420691337);
  const rand = () => rng();
  const randInt = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
  const pick = <T,>(a: T[]): T => a[Math.floor(rand() * a.length)];

  const SW = 14;
  const MSW = 20;
  const SIDE = 3;
  const GAP = SW / 2 + SIDE;

  const hRows = STREET_H_ROWS;
  const vCols = STREET_V_COLS;
  const MAIN_H = 12;
  const MAIN_V = 15;

  const streets: CityStreet[] = [];
  for (const row of hRows) {
    const main = row === MAIN_H;
    const sw = main ? MSW : SW;
    streets.push({ x: 0, y: row * CELL_H - sw / 2, w: MAP_WIDTH, h: sw, horiz: true, main });
  }
  for (const col of vCols) {
    const main = col === MAIN_V;
    const sw = main ? MSW : SW;
    streets.push({ x: col * CELL_W - sw / 2, y: 0, w: sw, h: MAP_HEIGHT, horiz: false, main });
  }

  const hBounds = [0, ...hRows, GRID_ROWS];
  const vBounds = [0, ...vCols, GRID_COLS];

  // House colors (warm residential palette)
  const houseWalls = [
    "#d4a574", "#c4956a", "#b8a08a", "#d9c4a8", "#c9b090",
    "#e8d0b0", "#d0b898", "#c8a878", "#dcc8a8", "#c0a880",
    "#b09878", "#d8c098", "#e0c8a0", "#c8b898",
  ];
  const roofColors = [
    "#6a3a2a", "#5a3020", "#7a4a30", "#4a2a1a", "#8a5a3a",
    "#5a4030", "#704838", "#604030", "#885840",
  ];

  const blocks: CityBlock[] = [];
  const lamps: Array<{ x: number; y: number }> = [];

  // Depot block index: bottom-left area (bri near end, bci=0)
  const depotBri = hBounds.length - 2;
  const depotBci = 0;
  // Return bay: bottom-right area
  const retBri = hBounds.length - 2;
  const retBci = vBounds.length - 2;

  for (let bri = 0; bri < hBounds.length - 1; bri++) {
    for (let bci = 0; bci < vBounds.length - 1; bci++) {
      const r0 = hBounds[bri], r1 = hBounds[bri + 1];
      const c0 = vBounds[bci], c1 = vBounds[bci + 1];

      const x = c0 * CELL_W + (bci === 0 ? SIDE : GAP);
      const y = r0 * CELL_H + (bri === 0 ? SIDE : GAP);
      const x2 = c1 * CELL_W - (bci === vBounds.length - 2 ? SIDE : GAP);
      const y2 = r1 * CELL_H - (bri === hBounds.length - 2 ? SIDE : GAP);
      const w = x2 - x;
      const h = y2 - y;

      if (w < 30 || h < 30) continue;

      // Depot block
      if (bri === depotBri && bci === depotBci) {
        blocks.push({ x, y, w, h, kind: "plaza" as CityBlock["kind"], bldgs: [], trees: [], isDepot: true } as CityBlock & { isDepot?: boolean });
        if (bci > 0 && bri > 0) lamps.push({ x: x - 4, y: y - 4 });
        continue;
      }
      // Return bay block
      if (bri === retBri && bci === retBci) {
        blocks.push({ x, y, w, h, kind: "plaza" as CityBlock["kind"], bldgs: [], trees: [], isReturnBay: true } as CityBlock & { isReturnBay?: boolean });
        if (bci > 0 && bri > 0) lamps.push({ x: x - 4, y: y - 4 });
        continue;
      }

      const roll = rand();
      // Water/river in a band
      const isWater = (bri <= 1 && bci <= 2) || (bri === 2 && bci === 0) || (bri === 0 && bci === 3);

      let kind: CityBlock["kind"] = "buildings";
      if (isWater) kind = "water";
      else if (roll < 0.18) kind = "park";
      else if (roll < 0.22) kind = "plaza";

      const block: CityBlock = { x, y, w, h, kind, bldgs: [], trees: [] };

      if (kind === "park") {
        const n = randInt(16, 32);
        for (let t = 0; t < n; t++) {
          block.trees.push({
            x: rand() * (w - 14) + 7,
            y: rand() * (h - 14) + 7,
            v: randInt(0, 2),
          });
        }
      } else if (kind === "buildings") {
        // Generate houses (residential)
        const rowCount = h > 80 ? 2 : 1;
        const rowH = h / rowCount;
        for (let br = 0; br < rowCount; br++) {
          let cx = 3;
          while (cx < w - 16) {
            const bw = randInt(28, 52);
            const bh = randInt(28, Math.min(54, rowH - 8));
            if (cx + bw > w - 3) break;
            block.bldgs.push({
              x: cx,
              y: br * rowH + (rowH - bh - 4),
              w: bw,
              h: bh,
              color: pick(houseWalls),
              roofColor: pick(roofColors),
              winAlpha: 0.18 + rand() * 0.22,
              antenna: rand() > 0.88,
              hasChimney: rand() > 0.65,
              hasFence: rand() > 0.55,
            } as CityBldg & { roofColor?: string; hasChimney?: boolean; hasFence?: boolean });
            cx += bw + randInt(6, 14);
          }
        }
        // Add street-side trees
        const treeCount = randInt(2, 5);
        for (let t = 0; t < treeCount; t++) {
          block.trees.push({
            x: rand() * w,
            y: rand() > 0.5 ? 2 : h - 14,
            v: randInt(0, 2),
          });
        }
      }

      blocks.push(block);

      // Street lamps at intersections
      if (bci > 0 && bri > 0) lamps.push({ x: x - 4, y: y - 4 });
      if (bci < vBounds.length - 2 && bri > 0) lamps.push({ x: x + w, y: y - 4 });
    }
  }

  return { streets, blocks, lamps };
}

// Pre-compute city layout (deterministic, only runs once)
const CITY = generateCity();

// ==========================================
// Pixel art components
// ==========================================

// Tree sprite
function TreeSprite({ variant = 0 }: { variant?: number }) {
  const treeColors = [
    "from-emerald-700 to-emerald-900",
    "from-green-600 to-green-800",
    "from-teal-700 to-teal-900",
  ];
  const color = treeColors[variant % treeColors.length];

  return (
    <div className="flex flex-col items-center">
      <div className={`w-6 h-8 bg-gradient-to-b ${color} rounded-t-full relative shadow-md`}>
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-b from-emerald-500 to-emerald-700 rounded-full" />
      </div>
      <div className="w-2 h-3 bg-gradient-to-b from-amber-900 to-amber-950" />
    </div>
  );
}

// Grass patch
function GrassPatch({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-16 h-16" : "w-12 h-12";
  return (
    <div className={`${dims} bg-gradient-to-br from-emerald-600/20 to-green-700/20 rounded-full blur-sm`} />
  );
}

// Park bench
function ParkBench() {
  return (
    <div className="w-8 h-3 bg-gradient-to-b from-amber-800 to-amber-950 rounded-sm relative">
      <div className="absolute -bottom-1 left-1 w-1 h-2 bg-slate-700" />
      <div className="absolute -bottom-1 right-1 w-1 h-2 bg-slate-700" />
    </div>
  );
}

// Street lamp
function StreetLamp({ lit = true }: { lit?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-4 h-4 rounded-full ${lit ? "bg-yellow-400/80 shadow-[0_0_8px_rgba(250,204,21,0.6)]" : "bg-slate-600/40"}`}>
        {lit && <div className="w-2 h-2 bg-yellow-200 rounded-full absolute top-1 left-1 blur-[1px]" />}
      </div>
      <div className="w-1 h-6 bg-slate-700" />
      <div className="w-3 h-1 bg-slate-800" />
    </div>
  );
}

// Road tile
function RoadTile({ variant = "straight" }: { variant?: "straight" | "corner" | "intersection" }) {
  return (
    <div className="w-full h-full bg-slate-700 relative">
      {/* Road texture */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "linear-gradient(180deg, transparent 48%, rgba(0,0,0,0.3) 49%, rgba(0,0,0,0.3) 51%, transparent 52%)",
        backgroundSize: "100% 8px",
      }} />
      {/* Center line */}
      {variant === "straight" && (
        <div className="absolute top-1/2 left-0 right-0 h-[2px] border-t-2 border-dashed border-yellow-400/40" />
      )}
      {variant === "intersection" && (
        <>
          <div className="absolute top-0 bottom-0 left-1/2 w-[2px] border-l-2 border-dashed border-yellow-400/40" />
          <div className="absolute left-0 right-0 top-1/2 h-[2px] border-t-2 border-dashed border-yellow-400/40" />
        </>
      )}
    </div>
  );
}

// City building with pixel art detail
function CityBuilding({ height = "md", color = "blue" }: { height?: "sm" | "md" | "lg" | "xl"; color?: "blue" | "gray" | "purple" | "red" }) {
  const heights = {
    sm: "h-16",
    md: "h-24",
    lg: "h-32",
    xl: "h-40",
  };
  
  const colors = {
    blue: "from-blue-900 to-blue-950",
    gray: "from-slate-700 to-slate-900",
    purple: "from-purple-900 to-purple-950",
    red: "from-red-900 to-red-950",
  };

  const windowColor = color === "blue" ? "bg-cyan-400/60" : color === "purple" ? "bg-purple-400/60" : "bg-yellow-400/40";

  return (
    <div className={`w-14 ${heights[height]} bg-gradient-to-b ${colors[color]} border border-slate-800 rounded-t-sm relative shadow-2xl`}>
      {/* Windows grid */}
      <div className="grid grid-cols-3 gap-[3px] p-1 mt-2">
        {Array.from({ length: height === "sm" ? 6 : height === "md" ? 9 : height === "lg" ? 12 : 15 }).map((_, i) => (
          <div 
            key={i} 
            className={`w-[6px] h-[4px] ${Math.random() > 0.3 ? windowColor : "bg-slate-900"} rounded-[1px]`} 
          />
        ))}
      </div>
      {/* Rooftop antenna */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[2px] h-3 bg-red-500">
        <div className="absolute top-0 w-1 h-1 bg-red-600 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

// Mini town block (background detail)
function TownBlock({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "w-10 h-8" : size === "lg" ? "w-16 h-12" : "w-12 h-10";
  return (
    <div className={`${dims} bg-[#caa77d] border border-[#8a6b46] rounded-sm shadow-[0_2px_6px_rgba(0,0,0,0.2)] relative`}>
      <div className="absolute -top-2 left-1 w-6 h-2 bg-[#9b6f4d] rounded-sm" />
      <div className="absolute top-2 left-2 w-2 h-2 bg-[#f6e1c8] rounded-[1px]" />
      <div className="absolute top-2 right-2 w-2 h-2 bg-[#f6e1c8] rounded-[1px]" />
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#6b4b2e] rounded-[1px]" />
    </div>
  );
}

function HouseSprite({ variant = 0 }: { variant?: number }) {
  const palettes = [
    { wall: "bg-[#e5c6a1]", roof: "bg-[#a7663b]", door: "bg-[#6b4b2e]" },
    { wall: "bg-[#d9b8a2]", roof: "bg-[#8a5b3a]", door: "bg-[#5b3f2c]" },
    { wall: "bg-[#f1d4b0]", roof: "bg-[#b56d3b]", door: "bg-[#6a4a33]" },
  ];
  const palette = palettes[variant % palettes.length];

  return (
    <div className="relative w-8 h-7">
      <div className={`absolute bottom-0 left-0 right-0 h-4 ${palette.wall} border border-[#8a6b46] rounded-[2px]`}>
        <div className="absolute left-1 top-1 w-2 h-2 bg-[#f6e1c8] rounded-[1px]" />
        <div className={`absolute right-1 bottom-0.5 w-2 h-2 ${palette.door} rounded-[1px]`} />
      </div>
      <div className={`absolute -top-1 left-0 right-0 h-3 ${palette.roof} border border-[#7a5131] skew-x-[-12deg] rounded-[1px]`} />
    </div>
  );
}

function BusSprite({
  status,
  name,
  size = "md",
  onClick,
  selected,
}: {
  status: string;
  name: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  selected?: boolean;
}) {
  const scale = size === "sm" ? 0.7 : size === "lg" ? 1.3 : 1;
  const busColor = status === "BUSY" ? "from-red-600 to-red-800" : "from-red-500 to-red-700";
  
  const glowClass =
    status === "BUSY" ? "shadow-[0_0_16px_rgba(220,38,38,0.8)]" :
    status === "ERROR" ? "shadow-[0_0_12px_rgba(255,165,0,0.6)] animate-pulse" :
    selected ? "shadow-[0_0_18px_rgba(59,130,246,0.7)]" : "shadow-[0_0_8px_rgba(220,38,38,0.3)]";

  return (
    <button
      onClick={onClick}
      className={`relative group ${glowClass} transition-all duration-300`}
      title={`${name} (${status})`}
      style={{ transform: `scale(${scale})` }}
    >
      <div className="relative">
        {/* Bus body - Big Red Bus style */}
        <div className={`w-16 h-10 bg-gradient-to-br ${busColor} rounded-md relative border-2 border-red-900/40 shadow-lg`}>
          {/* Top rounded section */}
          <div className="absolute -top-1 left-2 right-2 h-3 bg-gradient-to-b from-red-400 to-red-600 rounded-t-lg border-t-2 border-red-900/30" />
          
          {/* Windows - darker squares */}
          <div className="absolute top-1 left-2 flex gap-[3px]">
            <div className="w-[8px] h-[5px] bg-slate-900/80 rounded-[1px]" />
            <div className="w-[8px] h-[5px] bg-slate-900/80 rounded-[1px]" />
            <div className="w-[8px] h-[5px] bg-slate-900/80 rounded-[1px]" />
          </div>
          
          {/* Front grill */}
          <div className="absolute bottom-1 right-1 w-3 h-4 bg-slate-800 rounded-[2px] border border-slate-700">
            <div className="w-full h-[2px] bg-slate-600 mt-[2px]" />
            <div className="w-full h-[2px] bg-slate-600 mt-[2px]" />
          </div>
          
          {/* Door */}
          <div className="absolute bottom-1 left-2 w-4 h-5 bg-slate-900/60 rounded-[1px]" />
        </div>
        
        {/* Wheels */}
        <div className="absolute -bottom-[3px] left-[6px] w-[6px] h-[6px] rounded-full bg-slate-950 border-2 border-slate-700 shadow-md" />
        <div className="absolute -bottom-[3px] right-[6px] w-[6px] h-[6px] rounded-full bg-slate-950 border-2 border-slate-700 shadow-md" />
        
        {/* Headlights when BUSY */}
        {status === "BUSY" && (
          <>
            <div className="absolute bottom-2 -right-[2px] w-[4px] h-[4px] rounded-full bg-yellow-300 animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.9)]" />
            <span className="absolute -top-4 -right-2 text-[12px] animate-bounce">💨</span>
          </>
        )}
        
        {/* Status indicator light on roof */}
        <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${
          status === "ONLINE" ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" :
          status === "BUSY" ? "bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.9)]" :
          status === "ERROR" ? "bg-red-500 animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.8)]" :
          "bg-slate-600"
        }`} />
        
        {/* Name label on hover */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-900/90 px-2 py-1 rounded text-[9px] text-white whitespace-nowrap z-30 pointer-events-none border border-red-700/50">
          {name}
        </div>
      </div>
    </button>
  );
}

function BuildingSprite({
  repoUrl,
  runsHere,
  isTarget,
  onClick,
  selected,
}: {
  repoUrl: string;
  runsHere: RunDetail[];
  isTarget: boolean;
  onClick?: () => void;
  selected?: boolean;
}) {
  // Extract repo name from URL
  const repoName = repoUrl.replace(/.*\//, "").replace(".git", "") || repoUrl;
  const activeRuns = runsHere.filter((r) => r.status === "RUNNING").length;

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center gap-0.5 transition-all duration-300
        ${selected ? "scale-110" : "hover:scale-105"}
        ${isTarget ? "animate-pulse" : ""}
      `}
    >
      {/* Skyscraper */}
      <div
        className={`w-28 h-48 rounded-sm border-2 flex flex-col items-center justify-between relative overflow-hidden transition-all
          ${selected
            ? "border-cyan-400/70 bg-cyan-500/15 shadow-[0_0_22px_rgba(34,211,238,0.45)]"
            : isTarget
              ? "border-amber-400/50 bg-amber-500/10 shadow-[0_0_18px_rgba(255,165,0,0.35)]"
              : "border-slate-700/60 bg-slate-800/70 hover:border-slate-500/60"
          }
        `}
      >
        {/* Glass highlight */}
        <div className="absolute top-0 left-0 w-4 h-full bg-white/10" />
        {/* Windows */}
        <div className="grid grid-cols-4 gap-[3px] mt-3 px-2">
          {Array.from({ length: 32 }).map((_, i) => (
            <div
              key={i}
              className={`w-[10px] h-[8px] rounded-[1px] ${
                i < activeRuns * 4 + 4 ? "bg-yellow-300/80" : "bg-slate-600/40"
              }`}
            />
          ))}
        </div>
        {/* Lobby */}
        <div className="w-[24px] h-[16px] bg-slate-700/70 rounded-t-[3px] mb-2" />
      </div>
      {/* Label */}
      <span
        className={`text-sm max-w-[112px] truncate leading-none mt-2 font-medium ${
          selected ? "text-cyan-300" : "text-slate-500 group-hover:text-slate-300"
        }`}
      >
        {repoName}
      </span>
      {/* Active count badge */}
      {activeRuns > 0 && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-red-500/50 z-20 border-2 border-red-900">
          {activeRuns}
        </div>
      )}
    </button>
  );
}

// ==========================================
// Road / Path rendering
// ==========================================

function RoadPath({
  fromCol,
  fromRow,
  toCol,
  toRow,
  active,
}: {
  fromCol: number;
  fromRow: number;
  toCol: number;
  toRow: number;
  active: boolean;
}) {
  const x1 = fromCol * CELL_W + CELL_W / 2;
  const y1 = fromRow * CELL_H + CELL_H / 2;
  const x2 = toCol * CELL_W + CELL_W / 2;
  const y2 = toRow * CELL_H + CELL_H / 2;

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={active ? "rgba(220, 38, 38, 0.3)" : "rgba(100, 116, 139, 0.1)"}
      strokeWidth={active ? 3 : 1}
      strokeDasharray={active ? "8 4" : "4 4"}
      className={active ? "animate-[dash_1s_linear_infinite]" : ""}
    />
  );
}

// ==========================================
// Inspector Panel (right side)
// ==========================================

function InspectorPanel({
  node,
  runs,
  onClose,
}: {
  node: WorkflowNode | null;
  runs: RunDetail[];
  onClose: () => void;
}) {
  if (!node) return null;

  const statusColors: Record<string, string> = {
    ONLINE: "text-emerald-400",
    BUSY: "text-amber-400",
    OFFLINE: "text-slate-500",
    ERROR: "text-red-400",
  };

  const statusLabels: Record<string, string> = {
    ONLINE: "On Shift",
    BUSY: "En Route",
    OFFLINE: "Off Duty",
    ERROR: "Breakdown",
  };

  const nodeRuns = runs.filter((r) => r.node.id === node.id);

  return (
    <div className="w-80 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50 flex flex-col overflow-hidden animate-[slideInRight_200ms_ease-out]">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BusSprite status={node.status} name={node.name} size="sm" />
          <div>
            <h3 className="text-sm font-bold text-white">{node.name}</h3>
            <span className={`text-xs ${statusColors[node.status] || "text-slate-400"}`}>
              {statusLabels[node.status] || node.status}
            </span>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
          <FiX size={16} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 p-3 border-b border-slate-700/30">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{node.totalRuns}</div>
          <div className="text-[10px] text-slate-500 uppercase">Trips</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-cyan-400">{nodeRuns.filter((r) => r.status === "RUNNING").length}</div>
          <div className="text-[10px] text-slate-500 uppercase">Active</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-emerald-400">{nodeRuns.filter((r) => r.status === "DONE").length}</div>
          <div className="text-[10px] text-slate-500 uppercase">Done</div>
        </div>
      </div>

      {/* ID Card */}
      <div className="p-3 border-b border-slate-700/30 space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <FiCpu className="text-slate-500" size={12} />
          <span className="text-slate-400">Type:</span>
          <span className="text-white font-mono text-[11px]">{node.type}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <FiActivity className="text-slate-500" size={12} />
          <span className="text-slate-400">Last seen:</span>
          <span className="text-white">{node.lastHeartbeatAt ? timeAgo(node.lastHeartbeatAt) : "Never"}</span>
        </div>
        {node.currentJobId && (
          <div className="flex items-center gap-2 text-xs">
            <FiBox className="text-amber-400" size={12} />
            <span className="text-slate-400">Current:</span>
            <span className="text-amber-300 font-mono text-[10px] truncate">{node.currentJobId}</span>
          </div>
        )}
      </div>

      {/* Recent routes */}
      <div className="flex-1 overflow-y-auto p-3">
        <h4 className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-2">Recent Routes</h4>
        {nodeRuns.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-6">No dispatches yet</p>
        ) : (
          <div className="space-y-1.5">
            {nodeRuns.slice(0, 10).map((run) => {
              const runColors: Record<string, string> = {
                RUNNING: "border-l-blue-500 bg-blue-500/5",
                DONE: "border-l-emerald-500 bg-emerald-500/5",
                FAILED: "border-l-red-500 bg-red-500/5",
                NEEDS_ANSWER: "border-l-amber-500 bg-amber-500/5",
              };
              return (
                <div
                  key={run.id}
                  className={`border-l-2 rounded-r-md p-2 ${runColors[run.status] || "border-l-slate-600"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-white font-medium truncate max-w-[160px]">
                      {run.request?.todo?.title || run.branchName}
                    </span>
                    <span className="text-[9px] text-slate-500">{timeAgo(run.startedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-slate-500 font-mono truncate">{run.branchName}</span>
                    {run.prUrl && (
                      <a
                        href={run.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FiGitPullRequest size={10} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// Building Inspector
// ==========================================

function BuildingInspector({
  repoUrl,
  runs,
  building,
  onClose,
  onCreateRoute,
}: {
  repoUrl: string;
  runs: RunDetail[];
  building: any;
  onClose: () => void;
  onCreateRoute: () => void;
}) {
  const repoName = building?.repoName || repoUrl.replace(/.*\//, "").replace(".git", "") || repoUrl;
  const repoRuns = runs.filter((r) => r.request?.repoUrl === repoUrl);

  return (
    <div className="w-80 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50 flex flex-col overflow-hidden animate-[slideInRight_200ms_ease-out]">
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white truncate">{repoName}</h3>
          <span className="text-[10px] text-slate-400 font-mono truncate block">{building?.repoFullName || repoUrl}</span>
          {building?.repoDescription && (
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{building.repoDescription}</p>
          )}
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors ml-2 flex-shrink-0">
          <FiX size={16} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 p-3 border-b border-slate-700/30">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-400">{repoRuns.filter((r) => r.status === "RUNNING").length}</div>
          <div className="text-[10px] text-slate-500 uppercase">Active</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-emerald-400">{repoRuns.filter((r) => r.status === "DONE").length}</div>
          <div className="text-[10px] text-slate-500 uppercase">Done</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-400">{repoRuns.filter((r) => r.status === "FAILED").length}</div>
          <div className="text-[10px] text-slate-500 uppercase">Failed</div>
        </div>
      </div>

      {/* Create Route Button */}
      <div className="p-3 border-b border-slate-700/30">
        <button
          onClick={onCreateRoute}
          className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-sm transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
        >
          <FiTerminal size={14} />
          Create Route
        </button>
      </div>

      {building?.repoLanguage && (
        <div className="px-3 py-2 border-b border-slate-700/30 flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full bg-cyan-400/60" />
          <span className="text-slate-400">Language:</span>
          <span className="text-white">{building.repoLanguage}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3">
        <h4 className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-2">Work History</h4>
        {repoRuns.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-6">No routes to this building yet</p>
        ) : (
          <div className="space-y-1.5">
            {repoRuns.map((run) => {
              const runColors: Record<string, string> = {
                RUNNING: "border-l-blue-500 bg-blue-500/5",
                DONE: "border-l-emerald-500 bg-emerald-500/5",
                FAILED: "border-l-red-500 bg-red-500/5",
                NEEDS_ANSWER: "border-l-amber-500 bg-amber-500/5",
              };
              return (
                <div key={run.id} className={`border-l-2 rounded-r-md p-2 ${runColors[run.status] || "border-l-slate-600"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-white font-medium truncate max-w-[160px]">
                      {run.request?.todo?.title || run.branchName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[9px] text-slate-500">
                    <span>{run.node.name}</span>
                    <span>·</span>
                    <span>{timeAgo(run.startedAt)}</span>
                    {run.prUrl && (
                      <a href={run.prUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 ml-auto">
                        <FiExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// Create Route Modal
// ==========================================

function CreateRouteModal({
  building,
  nodes,
  onClose,
  onSuccess,
}: {
  building: any;
  nodes: WorkflowNode[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [task, setTask] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const availableNodes = nodes.filter((n) => n.status === "ONLINE" || n.status === "BUSY");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!task.trim()) {
      setError("Task description is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/dispatch/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: task.trim(),
          repoUrl: building.repoUrl,
          nodeId: selectedNodeId || null,
          priority,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create route");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create route");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700/50 rounded-xl max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-red-500/30">
              🚌
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create Route</h3>
              <p className="text-xs text-slate-400">Dispatch bus to {building.repoName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
            <FiX size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
              <FiAlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Task Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Task Description</label>
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g., Fix navbar padding on mobile"
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-colors"
              autoFocus
            />
          </div>

          {/* Repo (readonly) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Repository</label>
            <div className="px-3 py-2 bg-slate-800/30 border border-slate-700/30 rounded-lg text-slate-400 text-sm">
              {building.repoFullName || building.repoName}
            </div>
          </div>

          {/* Assign Bus */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Assign Bus
              <span className="text-slate-500 ml-2 text-xs">(optional - auto-assigns if empty)</span>
            </label>
            <select
              value={selectedNodeId}
              onChange={(e) => setSelectedNodeId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-colors"
            >
              <option value="">Any Available Bus</option>
              {availableNodes.map((node) => (
                <option key={node.id} value={node.id}>
                  🚌 {node.name} ({node.status})
                </option>
              ))}
            </select>
            {availableNodes.length === 0 && (
              <p className="text-xs text-amber-400 mt-1">⚠️ No buses online. Run: npm run seed:node</p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
            <div className="grid grid-cols-4 gap-2">
              {(["LOW", "MEDIUM", "HIGH", "URGENT"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    priority === p
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                      : "bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !task.trim()}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-bold shadow-lg shadow-red-500/30"
            >
              {isSubmitting ? "Dispatching..." : "🚀 Dispatch Route"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// Utility
// ==========================================

function timeAgo(date: string | null): string {
  if (!date) return "Never";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ==========================================
// Main Map Component
// ==========================================

export default function MapClient() {
  const router = useRouter();
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [runs, setRuns] = useState<RunDetail[]>([]);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [showCreateRoute, setShowCreateRoute] = useState(false);
  const [tick, setTick] = useState(0); // animation tick
  const mapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Desmos-style camera: pan + zoom centered on cursor
  const [camera, setCamera] = useState({ x: 0, y: 0, scale: 0.85 });
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, cx: 0, cy: 0 });

  const MIN_ZOOM = 0.08;
  const MAX_ZOOM = 6;
  const clampScale = useCallback((s: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, s)), []);

  const zoomIn = useCallback(() => {
    setCamera((c) => {
      const el = mapRef.current;
      if (!el) return { ...c, scale: clampScale(c.scale * 1.25) };
      const rect = el.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const newScale = clampScale(c.scale * 1.25);
      const ratio = newScale / c.scale;
      return { x: cx - ratio * (cx - c.x), y: cy - ratio * (cy - c.y), scale: newScale };
    });
  }, [clampScale]);

  const zoomOut = useCallback(() => {
    setCamera((c) => {
      const el = mapRef.current;
      if (!el) return { ...c, scale: clampScale(c.scale / 1.25) };
      const rect = el.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const newScale = clampScale(c.scale / 1.25);
      const ratio = newScale / c.scale;
      return { x: cx - ratio * (cx - c.x), y: cy - ratio * (cy - c.y), scale: newScale };
    });
  }, [clampScale]);

  const zoomReset = useCallback(() => {
    const el = mapRef.current;
    if (!el) { setCamera({ x: 0, y: 0, scale: 0.85 }); return; }
    const rect = el.getBoundingClientRect();
    setCamera({ x: (rect.width - MAP_WIDTH * 0.85) / 2, y: (rect.height - MAP_HEIGHT * 0.85) / 2, scale: 0.85 });
  }, []);

  // ---- Data fetching ----
  const fetchData = useCallback(async () => {
    try {
      const [nodesRes, runsRes, reposRes] = await Promise.all([
        fetch("/api/ceo/nodes"),
        fetch("/api/ceo/runs?limit=50"),
        fetch("/api/ceo/repos"),
      ]);
      if (nodesRes.ok) {
        const nd = await nodesRes.json();
        setNodes(nd.nodes || []);
      }
      if (runsRes.ok) {
        const rd = await runsRes.json();
        setRuns(rd.runs || []);
      }
      if (reposRes.ok) {
        const rp = await reposRes.json();
        setRepos(rp.repos || []);
      }
    } catch (err) {
      console.error("[Map] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Animation tick every 100ms for smooth bus movement
  useEffect(() => {
    const t = setInterval(() => setTick((p) => p + 1), 100);
    return () => clearInterval(t);
  }, []);

  // Desmos-style: scroll wheel zooms centered on cursor, any scroll
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const zoomFactor = e.deltaY > 0 ? 1 / 1.08 : 1.08;
      setCamera((c) => {
        const newScale = clampScale(c.scale * zoomFactor);
        const ratio = newScale / c.scale;
        return { x: cx - ratio * (cx - c.x), y: cy - ratio * (cy - c.y), scale: newScale };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [clampScale]);

  // Pan via mouse drag
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const onDown = (e: PointerEvent) => {
      // Pan on middle-click or left-click when not clicking a button/link
      const tag = (e.target as HTMLElement)?.closest?.("button, a");
      if (e.button === 1 || (e.button === 0 && !tag)) {
        isPanning.current = true;
        panStart.current = { x: e.clientX, y: e.clientY, cx: camera.x, cy: camera.y };
        el.style.cursor = "grabbing";
        el.setPointerCapture(e.pointerId);
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!isPanning.current) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setCamera((c) => ({ ...c, x: panStart.current.cx + dx, y: panStart.current.cy + dy }));
    };
    const onUp = () => {
      isPanning.current = false;
      el.style.cursor = "";
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clampScale, camera.x, camera.y]);

  // Center map on first load
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const initScale = Math.min(rect.width / MAP_WIDTH, rect.height / MAP_HEIGHT) * 0.9;
    setCamera({
      x: (rect.width - MAP_WIDTH * initScale) / 2,
      y: (rect.height - MAP_HEIGHT * initScale) / 2,
      scale: clampScale(initScale),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // ---- Derive buildings from GitHub repos + runs ----
  const buildings = useMemo(() => {
    // Create map of runs by repo URL
    const runsMap = new Map<string, RunDetail[]>();
    runs.forEach((run) => {
      const url = run.request?.repoUrl;
      if (!url) return;
      if (!runsMap.has(url)) runsMap.set(url, []);
      runsMap.get(url)!.push(run);
    });

    // Convert GitHub repos to buildings, merging with runs
    return repos.map((repo, i) => {
      const repoRuns = runsMap.get(repo.cloneUrl) || [];
      return {
        repoUrl: repo.cloneUrl,
        repoName: repo.name,
        repoFullName: repo.fullName,
        repoDescription: repo.description,
        repoLanguage: repo.language,
        runs: repoRuns,
        ...buildingPosition(repo.cloneUrl, i),
      };
    });
  }, [repos, runs]);

  // ---- Compute bus positions (snapped to streets) ----
  const busPositions = useMemo(() => {
    // Find nearest street row for a given row
    const snapRow = (r: number) => STREET_H_ROWS.reduce((best, sr) => Math.abs(sr - r) < Math.abs(best - r) ? sr : best, STREET_H_ROWS[0]);
    const snapCol = (c: number) => STREET_V_COLS.reduce((best, sc) => Math.abs(sc - c) < Math.abs(best - c) ? sc : best, STREET_V_COLS[0]);

    return nodes.map((node, nodeIdx) => {
      const activeRun = runs.find((r) => r.node.id === node.id && r.status === "RUNNING");

      if (activeRun && node.status === "BUSY") {
        const targetBuilding = buildings.find((b) => b.repoUrl === activeRun.request?.repoUrl);
        if (targetBuilding) {
          const elapsed = (Date.now() - new Date(activeRun.startedAt).getTime()) / 1000;
          const progress = Math.min(1, (elapsed % 10) / 8);
          const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

          // Travel on streets: first go horizontal on depot's street row, then vertical
          const depotRow = DEPOT.row;
          const targetRow = snapRow(targetBuilding.row);
          const targetCol = snapCol(targetBuilding.col);

          let col: number, row: number;
          if (eased < 0.5) {
            // Phase 1: horizontal travel along depot street
            const hProgress = eased * 2;
            col = DEPOT.col + (targetCol - DEPOT.col) * hProgress;
            row = depotRow;
          } else {
            // Phase 2: vertical travel to target
            const vProgress = (eased - 0.5) * 2;
            col = targetCol;
            row = depotRow + (targetRow - depotRow) * vProgress;
          }
          return { node, col, row, targetRepo: activeRun.request?.repoUrl };
        }
      }

      const recentDone = runs.find(
        (r) => r.node.id === node.id && r.status === "DONE" && Date.now() - new Date(r.completedAt || r.startedAt).getTime() < 30_000
      );
      if (recentDone) {
        return { node, col: RETURN_BAY.col, row: RETURN_BAY.row, targetRepo: null };
      }

      // Parked at depot — stagger along the depot street
      return { node, col: DEPOT.col + 0.5 + nodeIdx * 0.8, row: DEPOT.row, targetRepo: null };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, runs, buildings, tick]);

  // ---- Selected state ----
  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) || null : null;

  // ---- Stats ----
  const activeCount = nodes.filter((n) => n.status === "ONLINE" || n.status === "BUSY").length;
  const busyCount = nodes.filter((n) => n.status === "BUSY").length;
  const runningRuns = runs.filter((r) => r.status === "RUNNING").length;

  // ==========================================
  // Render
  // ==========================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)] bg-admin-navy-deep">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 uppercase tracking-wider">Loading city map…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#0d1208] overflow-hidden">
      {/* ====================== MAP AREA ====================== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/30 bg-slate-900/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/ceo")}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
              title="Back to CEO Dashboard"
            >
              <FiArrowLeft size={16} />
              <span className="text-xs">Back</span>
            </button>
            <div className="h-4 w-[1px] bg-slate-700/50" />
            <FiMap className="text-cyan-400" size={18} />
            <h1 className="text-base font-bold text-white tracking-tight">City Map</h1>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest ml-2">Live</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-400">{activeCount} on shift</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-slate-400">{busyCount} driving</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FiGitPullRequest className="text-blue-400" size={12} />
              <span className="text-slate-400">{runningRuns} routes</span>
            </div>
            <button
              onClick={fetchData}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <FiRefreshCw size={14} />
            </button>
            <div className="flex items-center gap-1 bg-slate-900/40 border border-slate-700/40 rounded-lg p-1">
              <button
                onClick={zoomOut}
                className="p-1 rounded-md hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                title="Zoom out"
              >
                <FiZoomOut size={14} />
              </button>
              <span className="text-[10px] text-slate-400 w-10 text-center tabular-nums">
                {Math.round(camera.scale * 100)}%
              </span>
              <button
                onClick={zoomIn}
                className="p-1 rounded-md hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                title="Zoom in"
              >
                <FiZoomIn size={14} />
              </button>
              <button
                onClick={zoomReset}
                className="p-1 rounded-md hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                title="Reset zoom"
              >
                <FiMaximize size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Map canvas — Desmos-style infinite pan/zoom */}
        <div
          className="flex-1 relative overflow-hidden select-none"
          ref={mapRef}
          style={{ cursor: "grab" }}
          data-pannable="true"
        >
          {/* Grid lines behind everything for spatial reference */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            data-pannable="true"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)
              `,
              backgroundSize: `${40 * camera.scale}px ${40 * camera.scale}px`,
              backgroundPosition: `${camera.x % (40 * camera.scale)}px ${camera.y % (40 * camera.scale)}px`,
            }}
          />
          <div
            ref={canvasRef}
            data-pannable="true"
            style={{
              position: "absolute",
              width: MAP_WIDTH,
              height: MAP_HEIGHT,
              transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
              transformOrigin: "0 0",
              willChange: "transform",
            }}
          >
            {/* ============ PROCEDURAL CITY ============ */}

            {/* Dark ground base */}
            <div className="absolute inset-0 bg-[#1a2614]" data-pannable="true" />
            {/* Subtle ground noise */}
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)",
              backgroundSize: "14px 14px",
            }} />

            {/* City blocks (rendered under streets) */}
            {CITY.blocks.map((block, bi) => (
              <div key={`cblk-${bi}`} className="absolute" style={{ left: block.x, top: block.y, width: block.w, height: block.h }}>
                {/* Water */}
                {block.kind === "water" && (
                  <div className="absolute inset-0 rounded-sm overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2a5a8a] to-[#1a4a7a]" />
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: "repeating-linear-gradient(120deg, transparent 0, transparent 10px, rgba(255,255,255,0.08) 10px, rgba(255,255,255,0.08) 12px)",
                    }} />
                    <div className="absolute inset-0 opacity-10" style={{
                      backgroundImage: "repeating-linear-gradient(200deg, transparent 0, transparent 14px, rgba(100,180,255,0.12) 14px, rgba(100,180,255,0.12) 16px)",
                    }} />
                  </div>
                )}

                {/* Park */}
                {block.kind === "park" && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2a5a2a] to-[#1e4a1e] rounded-sm border border-[#3a6a3a]/30" />
                    <div className="absolute inset-0 opacity-30 rounded-sm" style={{
                      backgroundImage: "radial-gradient(circle at 2px 2px, rgba(100,200,100,0.25) 1px, transparent 0)",
                      backgroundSize: "8px 8px",
                    }} />
                    {/* Park paths */}
                    <div className="absolute left-1/2 top-[10%] bottom-[10%] w-[3px] bg-[#5a5a4a]/40 -translate-x-[1px]" />
                    <div className="absolute top-1/2 left-[10%] right-[10%] h-[3px] bg-[#5a5a4a]/40 -translate-y-[1px]" />
                    {block.trees.map((tree, ti) => (
                      <div key={ti} className="absolute" style={{ left: tree.x, top: tree.y, zIndex: 3 }}>
                        <TreeSprite variant={tree.v} />
                      </div>
                    ))}
                  </>
                )}

                {/* Plaza */}
                {block.kind === "plaza" && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#5a5a50] to-[#4a4a40] rounded-sm border border-[#6a6a5a]/20">
                    <div className="absolute inset-0 opacity-15" style={{
                      backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 18px), repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 18px)",
                    }} />
                    {/* Fountain in center */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#3a6a8a]/40 border border-[#4a7a9a]/30">
                      <div className="absolute inset-1 rounded-full bg-[#4a8ab0]/30" />
                    </div>
                  </div>
                )}

                {/* Houses */}
                {block.kind === "buildings" && (
                  <>
                    <div className="absolute inset-0 bg-[#1a2a16] rounded-sm" />
                    {/* Lawn texture */}
                    <div className="absolute inset-0 opacity-20 rounded-sm" style={{
                      backgroundImage: "radial-gradient(circle at 2px 2px, rgba(80,160,80,0.3) 1px, transparent 0)",
                      backgroundSize: "6px 6px",
                    }} />
                    {block.bldgs.map((b: any, bdi: number) => {
                      const roofColor = b.roofColor || "#6a3a2a";
                      const roofH = Math.max(8, b.h * 0.35);
                      return (
                        <div key={bdi} className="absolute" style={{ left: b.x, top: b.y - roofH, width: b.w, height: b.h + roofH }}>
                          {/* Fence */}
                          {b.hasFence && (
                            <div className="absolute -left-2 bottom-0 -right-2 h-[6px]" style={{
                              backgroundImage: "repeating-linear-gradient(90deg, #8a7a60 0, #8a7a60 2px, transparent 2px, transparent 6px)",
                            }}>
                              <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#8a7a60]" />
                            </div>
                          )}
                          {/* House wall */}
                          <div
                            className="absolute bottom-0 left-0 right-0"
                            style={{
                              height: b.h,
                              background: b.color,
                              border: "1px solid rgba(0,0,0,0.25)",
                              borderRadius: "1px",
                              boxShadow: "2px 3px 6px rgba(0,0,0,0.4)",
                            }}
                          >
                            {/* Windows */}
                            <div className="absolute inset-x-[3px] top-[4px] bottom-[6px] flex flex-wrap gap-[3px] content-start">
                              {Array.from({ length: Math.floor(b.w / 9) * Math.max(1, Math.floor(b.h / 14)) }).map((_, wi) => (
                                <div key={wi} className="w-[5px] h-[6px] rounded-[0.5px]" style={{
                                  background: `rgba(200,220,255,${b.winAlpha})`,
                                  border: "0.5px solid rgba(0,0,0,0.15)",
                                }} />
                              ))}
                            </div>
                            {/* Door */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-[2px]" style={{
                              width: Math.max(5, b.w * 0.2),
                              height: Math.max(8, b.h * 0.35),
                              background: roofColor,
                              border: "0.5px solid rgba(0,0,0,0.3)",
                            }} />
                          </div>
                          {/* Roof (triangle) */}
                          <div
                            className="absolute top-0 left-[-2px] right-[-2px]"
                            style={{
                              height: roofH,
                              background: roofColor,
                              clipPath: "polygon(0% 100%, 50% 0%, 100% 100%)",
                              filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.3))",
                            }}
                          />
                          {/* Chimney */}
                          {b.hasChimney && (
                            <div className="absolute" style={{
                              right: Math.max(3, b.w * 0.2),
                              top: roofH * 0.1,
                              width: 5,
                              height: roofH * 0.6,
                              background: "#6a5a4a",
                              borderRadius: "1px 1px 0 0",
                            }}>
                              <div className="absolute -top-1 -left-0.5 w-[6px] h-[2px] bg-[#7a6a5a] rounded-sm" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            ))}

            {/* Streets (on top of blocks) */}
            {CITY.streets.map((st, si) => (
              <div
                key={`st-${si}`}
                className="absolute"
                style={{
                  left: st.x,
                  top: st.y,
                  width: st.w,
                  height: st.h,
                  background: st.main ? "#3d3d3d" : "#353535",
                  zIndex: 2,
                }}
              >
                {/* Asphalt noise */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 0.5px, transparent 0)",
                  backgroundSize: "4px 4px",
                }} />
                {/* Center line */}
                {st.horiz ? (
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-[1px] h-[2px]" style={{
                    backgroundImage: "repeating-linear-gradient(90deg, rgba(255,200,40,0.5) 0, rgba(255,200,40,0.5) 14px, transparent 14px, transparent 22px)",
                  }} />
                ) : (
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-[1px] w-[2px]" style={{
                    backgroundImage: "repeating-linear-gradient(180deg, rgba(255,200,40,0.5) 0, rgba(255,200,40,0.5) 14px, transparent 14px, transparent 22px)",
                  }} />
                )}
                {/* Sidewalk curbs */}
                {st.horiz ? (
                  <>
                    <div className="absolute left-0 right-0 top-0 h-[3px] bg-[#6a6a5a]" />
                    <div className="absolute left-0 right-0 bottom-0 h-[3px] bg-[#6a6a5a]" />
                  </>
                ) : (
                  <>
                    <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-[#6a6a5a]" />
                    <div className="absolute top-0 bottom-0 right-0 w-[3px] bg-[#6a6a5a]" />
                  </>
                )}
                {/* Main street double line */}
                {st.main && st.horiz && (
                  <>
                    <div className="absolute left-0 right-0" style={{ top: "calc(50% - 4px)", height: 2, background: "rgba(255,200,40,0.3)" }} />
                    <div className="absolute left-0 right-0" style={{ top: "calc(50% + 2px)", height: 2, background: "rgba(255,200,40,0.3)" }} />
                  </>
                )}
                {st.main && !st.horiz && (
                  <>
                    <div className="absolute top-0 bottom-0" style={{ left: "calc(50% - 4px)", width: 2, background: "rgba(255,200,40,0.3)" }} />
                    <div className="absolute top-0 bottom-0" style={{ left: "calc(50% + 2px)", width: 2, background: "rgba(255,200,40,0.3)" }} />
                  </>
                )}
              </div>
            ))}

            {/* Street lamps (show every 3rd to avoid clutter) */}
            {CITY.lamps.filter((_, i) => i % 3 === 0).map((lamp, li) => (
              <div key={`lamp-${li}`} className="absolute" style={{ left: lamp.x, top: lamp.y, zIndex: 5 }}>
                <StreetLamp lit />
              </div>
            ))}

            {/* Intersection crosswalks */}
            {STREET_H_ROWS.map((row) =>
              STREET_V_COLS.map((col) => (
                <div key={`xwalk-${row}-${col}`}>
                  {/* Horizontal crosswalk */}
                  <div className="absolute" style={{
                    left: col * CELL_W - 16,
                    top: row * CELL_H - 14,
                    width: 32,
                    height: 4,
                    zIndex: 3,
                    backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.5) 4px, transparent 4px, transparent 7px)",
                  }} />
                  <div className="absolute" style={{
                    left: col * CELL_W - 16,
                    top: row * CELL_H + 10,
                    width: 32,
                    height: 4,
                    zIndex: 3,
                    backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.5) 4px, transparent 4px, transparent 7px)",
                  }} />
                  {/* Vertical crosswalk */}
                  <div className="absolute" style={{
                    left: col * CELL_W - 14,
                    top: row * CELL_H - 16,
                    width: 4,
                    height: 32,
                    zIndex: 3,
                    backgroundImage: "repeating-linear-gradient(180deg, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.5) 4px, transparent 4px, transparent 7px)",
                  }} />
                  <div className="absolute" style={{
                    left: col * CELL_W + 10,
                    top: row * CELL_H - 16,
                    width: 4,
                    height: 32,
                    zIndex: 3,
                    backgroundImage: "repeating-linear-gradient(180deg, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.5) 4px, transparent 4px, transparent 7px)",
                  }} />
                </div>
              ))
            )}

            {/* Depot & Return Bay rendered as special city blocks */}
            {CITY.blocks.filter((b: any) => b.isDepot || b.isReturnBay).map((block: any, i: number) => (
              <div
                key={`special-${i}`}
                className="absolute"
                style={{ left: block.x, top: block.y, width: block.w, height: block.h, zIndex: 6 }}
              >
                {block.isDepot && (
                  <div className="absolute inset-0 rounded-md border-2 border-amber-600/50 bg-gradient-to-br from-amber-900/30 to-amber-950/50">
                    {/* Depot floor markings */}
                    <div className="absolute inset-2 opacity-20" style={{
                      backgroundImage: "repeating-linear-gradient(45deg, rgba(255,200,0,0.3) 0, rgba(255,200,0,0.3) 2px, transparent 2px, transparent 12px)",
                    }} />
                    {/* Depot building */}
                    <div className="absolute top-2 left-2 right-2 h-[40%] bg-gradient-to-b from-[#5a4a3a] to-[#4a3a2a] rounded-t-md border border-[#6a5a4a]/50">
                      <div className="absolute inset-x-[10%] top-[20%] bottom-[10%] flex gap-[6px] items-end">
                        <div className="flex-1 h-full bg-[#8a7a6a]/20 rounded-sm" />
                        <div className="flex-1 h-[70%] bg-[#8a7a6a]/20 rounded-sm" />
                        <div className="flex-1 h-[85%] bg-[#8a7a6a]/20 rounded-sm" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <span className="text-[12px] font-bold text-amber-400/90 uppercase tracking-widest">🏭 Depot</span>
                      <span className="text-[10px] text-amber-500/60 mt-0.5">
                        {nodes.filter((n) => n.status === "ONLINE").length} idle
                      </span>
                    </div>
                  </div>
                )}
                {block.isReturnBay && (
                  <div className="absolute inset-0 rounded-md border-2 border-emerald-600/40 bg-gradient-to-br from-emerald-900/25 to-emerald-950/40">
                    {/* Parking lines */}
                    <div className="absolute inset-3 opacity-30" style={{
                      backgroundImage: "repeating-linear-gradient(90deg, rgba(52,211,153,0.4) 0, rgba(52,211,153,0.4) 2px, transparent 2px, transparent 30px)",
                    }} />
                    <div className="absolute top-2 left-2 right-2 h-[35%] bg-gradient-to-b from-[#2a4a3a] to-[#1a3a2a] rounded-t-md border border-[#3a5a4a]/40">
                      <div className="absolute inset-x-[15%] top-[25%] bottom-[15%] bg-[#3a6a4a]/15 rounded-sm" />
                    </div>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <span className="text-[12px] font-bold text-emerald-400/80 uppercase tracking-widest">🏁 Return Bay</span>
                      <span className="text-[10px] text-emerald-500/50 mt-0.5">
                        {runs.filter((r) => r.status === "DONE").length} delivered
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Buildings */}
            {buildings.map((b) => (
              <div
                key={b.repoUrl}
                className="absolute transition-all duration-500"
                style={{
                  left: b.col * CELL_W + CELL_W / 2 - 56,
                  top: b.row * CELL_H + CELL_H / 2 - 72,
                }}
              >
                <BuildingSprite
                  repoUrl={b.repoUrl}
                  runsHere={b.runs}
                  isTarget={busPositions.some((bp) => bp.targetRepo === b.repoUrl)}
                  selected={selectedRepo === b.repoUrl}
                  onClick={() => {
                    setSelectedRepo(selectedRepo === b.repoUrl ? null : b.repoUrl);
                    setSelectedNodeId(null);
                  }}
                />
              </div>
            ))}

            {/* Buses */}
            {busPositions.map((bp) => (
              <div
                key={bp.node.id}
                className="absolute z-10 transition-all duration-[800ms] ease-in-out"
                style={{
                  left: bp.col * CELL_W + CELL_W / 2 - 26,
                  top: bp.row * CELL_H + CELL_H / 2 - 16,
                }}
              >
                <BusSprite
                  status={bp.node.status}
                  name={bp.node.name}
                  size="lg"
                  selected={selectedNodeId === bp.node.id}
                  onClick={() => {
                    setSelectedNodeId(selectedNodeId === bp.node.id ? null : bp.node.id);
                    setSelectedRepo(null);
                  }}
                />
              </div>
            ))}

            {/* Empty state overlay */}
            {nodes.length === 0 && buildings.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center">
                    <FiMap className="text-slate-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">The city is quiet</p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      {repos.length === 0 ? "Configure GitHub integration to see your repos" : "Seed a node and queue a task to see buses drive"}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <code className="text-[10px] bg-slate-800/80 border border-slate-700/40 px-2 py-1 rounded text-cyan-400 font-mono">
                      npm run seed:node
                    </code>
                    <code className="text-[10px] bg-slate-800/80 border border-slate-700/40 px-2 py-1 rounded text-cyan-400 font-mono">
                      npm run create:request
                    </code>
                  </div>
                </div>
              </div>
            )}

            {/* Idle buses in depot (when no runs exist but nodes do) */}
            {nodes.length > 0 && buildings.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="flex gap-2">
                    {nodes.map((n) => (
                      <BusSprite key={n.id} status={n.status} name={n.name} size="lg" onClick={() => setSelectedNodeId(n.id)} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {nodes.length} bus{nodes.length !== 1 ? "es" : ""} parked at depot — no routes assigned
                  </p>
                  <p className="text-[10px] text-slate-600">
                    Queue a task: <code className="text-cyan-400 font-mono">npm run create:request</code>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="flex items-center justify-between px-5 py-2 border-t border-slate-700/20 bg-slate-900/30 text-[10px] text-slate-600">
          <div className="flex items-center gap-4">
            <span>🏢 {buildings.length} buildings</span>
            <span>🚌 {nodes.length} buses</span>
            <span>🛣 {runs.filter((r) => r.status === "RUNNING").length} active routes</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-emerald-500/60 animate-pulse" />
              <span>Polling every 5s</span>
            </div>
            <span className="text-slate-700">·</span>
            <span>Scroll to zoom · Drag to pan</span>
          </div>
        </div>
      </div>

      {/* ====================== INSPECTOR PANEL ====================== */}
      {selectedNode && (
        <InspectorPanel
          node={selectedNode}
          runs={runs}
          onClose={() => setSelectedNodeId(null)}
        />
      )}

      {selectedRepo && !selectedNodeId && (
        <BuildingInspector
          repoUrl={selectedRepo}
          runs={runs}
          building={buildings.find(b => b.repoUrl === selectedRepo)}
          onClose={() => setSelectedRepo(null)}
          onCreateRoute={() => setShowCreateRoute(true)}
        />
      )}

      {/* Create Route Modal */}
      {showCreateRoute && selectedRepo && (
        <CreateRouteModal
          building={buildings.find(b => b.repoUrl === selectedRepo)}
          nodes={nodes}
          onClose={() => setShowCreateRoute(false)}
          onSuccess={() => {
            fetchData();
            setShowCreateRoute(false);
          }}
        />
      )}
    </div>
  );
}
