"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import type { Canvas as FabricCanvas, FabricObject } from "fabric";
import Link from "next/link";
import { media } from "@/config/media";
import { products, type Product } from "@/lib/catalog";
import { Icon } from "@/components/icons";
import { PrintMark } from "@/components/product-artwork";

const fonts = ["DM Sans", "Bricolage Grotesque", "Georgia", "JetBrains Mono"];
type ToolTab = "upload" | "text" | "shapes" | "layers";
type StudioLayer = { id: string; label: string; object: FabricObject };
type NamedFabricObject = FabricObject & { name?: string; __tfId?: string; selectable?: boolean };
const isDesignObject = (object: object) => (object as { selectable?: boolean }).selectable !== false;
const nameObject = <T extends FabricObject>(object: T, name: string): T => { (object as NamedFabricObject).name = name; return object; };

function safeSvgMarkup(markup: string) {
  const parsed = new DOMParser().parseFromString(markup, "image/svg+xml");
  parsed.querySelectorAll("script,foreignObject,iframe,object,embed").forEach((element) => element.remove());
  parsed.querySelectorAll("*").forEach((element) => {
    [...element.attributes].forEach((attribute) => {
      if (/^on/i.test(attribute.name) || ((attribute.name === "href" || attribute.name.endsWith(":href")) && !attribute.value.startsWith("#") && !attribute.value.startsWith("data:image/"))) element.removeAttribute(attribute.name);
    });
  });
  return new XMLSerializer().serializeToString(parsed.documentElement);
}

export function StudioEditor() {
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<FabricCanvas | null>(null);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(0);
  const restoringRef = useRef(false);
  const historyTimerRef = useRef<number | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<ToolTab>("text");
  const [textInput, setTextInput] = useState("GOOD IDEAS\nGO PLACES");
  const [fontFamily, setFontFamily] = useState("Bricolage Grotesque");
  const [fontSize, setFontSize] = useState(38);
  const [inkColor, setInkColor] = useState("#ff4d2e");
  const [product, setProduct] = useState<Product>(products[0]);
  const [preview, setPreview] = useState("");
  const [layers, setLayers] = useState<StudioLayer[]>([]);
  const [activeLabel, setActiveLabel] = useState("Text layer");
  const [historyCount, setHistoryCount] = useState({ index: 0, length: 1 });
  const [saveState, setSaveState] = useState("");
  const [error, setError] = useState("");
  const [designTitle, setDesignTitle] = useState("My very good idea");
  const [isPublic, setIsPublic] = useState(false);

  const refreshLayers = useCallback((canvas: FabricCanvas) => {
    const nextLayers = canvas.getObjects().filter(isDesignObject).map((object, index) => {
      const named = object as NamedFabricObject;
      if (!named.__tfId) named.__tfId = `layer-${Date.now()}-${index}`;
      return { id: named.__tfId, label: named.name ?? (object.type === "i-text" || object.type === "textbox" ? "Type / art copy" : object.type === "image" ? "Uploaded image" : `${object.type.charAt(0).toUpperCase()}${object.type.slice(1)} shape`), object };
    });
    setLayers(nextLayers.reverse());
    const active = canvas.getActiveObject() as (FabricObject & { name?: string }) | undefined;
    if (active) setActiveLabel(active.name ?? (active.type === "i-text" || active.type === "textbox" ? "Type / art copy" : "Design layer"));
    else setActiveLabel("No layer selected");
  }, []);

  const updatePreview = useCallback((canvas: FabricCanvas) => {
    try {
      const data = canvas.toDataURL({ format: "png", multiplier: 2, filter: isDesignObject });
      setPreview(data);
    } catch {
      setError("Your preview could not be rendered. Try removing a large image.");
    }
  }, []);

  const captureHistory = useCallback((canvas: FabricCanvas) => {
    if (restoringRef.current) return;
    window.clearTimeout(historyTimerRef.current);
    historyTimerRef.current = window.setTimeout(() => {
      const serialized = JSON.stringify(canvas.toJSON());
      const stack = historyRef.current.slice(0, historyIndexRef.current + 1);
      if (stack[stack.length - 1] === serialized) return;
      stack.push(serialized);
      historyRef.current = stack.slice(-40);
      historyIndexRef.current = historyRef.current.length - 1;
      setHistoryCount({ index: historyIndexRef.current, length: historyRef.current.length });
      updatePreview(canvas);
      refreshLayers(canvas);
    }, 160);
  }, [refreshLayers, updatePreview]);

  useEffect(() => {
    let active = true;
    let instance: FabricCanvas | null = null;
    void (async () => {
      const fabric = await import("fabric");
      if (!active || !canvasEl.current) return;
      const canvas = new fabric.Canvas(canvasEl.current, { width: 420, height: 500, backgroundColor: "#f3eee4", preserveObjectStacking: true, selection: true, fireRightClick: false });
      instance = canvas;
      canvasRef.current = canvas;
      const shirt = new fabric.Path("M 134 54 L 172 34 Q 210 67 248 34 L 286 54 L 352 115 L 317 153 L 286 127 L 286 437 L 134 437 L 134 127 L 103 153 L 68 115 Z", {
        fill: "#fffdf8", stroke: "#ded7c9", strokeWidth: 2, selectable: false, evented: false, excludeFromExport: true,
      });
      const collar = new fabric.Path("M 172 34 Q 210 92 248 34", { fill: "", stroke: "#d3ccbe", strokeWidth: 3, selectable: false, evented: false, excludeFromExport: true });
      canvas.add(shirt, collar);
      const sample = nameObject(new fabric.IText("GOOD IDEAS\nGO PLACES", { left: 129, top: 191, width: 162, fontFamily: "Bricolage Grotesque", fontSize: 31, fontWeight: 800, lineHeight: 1.05, fill: "#ff4d2e", textAlign: "center" }), "Good ideas type");
      const accent = nameObject(new fabric.Circle({ left: 277, top: 177, radius: 9, fill: "#ffd23f", stroke: "#14131a", strokeWidth: 1.5 }), "Sun dot");
      canvas.add(sample, accent);
      canvas.on("object:added", () => { captureHistory(canvas); refreshLayers(canvas); });
      canvas.on("object:modified", () => { captureHistory(canvas); refreshLayers(canvas); });
      canvas.on("object:removed", () => { captureHistory(canvas); refreshLayers(canvas); });
      canvas.on("selection:created", () => refreshLayers(canvas));
      canvas.on("selection:updated", () => refreshLayers(canvas));
      canvas.on("selection:cleared", () => refreshLayers(canvas));
      window.setTimeout(() => {
        if (!active) return;
        const initial = JSON.stringify(canvas.toJSON());
        historyRef.current = [initial];
        historyIndexRef.current = 0;
        setHistoryCount({ index: 0, length: 1 });
        updatePreview(canvas);
        refreshLayers(canvas);
        setReady(true);
      }, 200);
    })();
    return () => {
      active = false;
      window.clearTimeout(historyTimerRef.current);
      if (instance) void instance.dispose();
      canvasRef.current = null;
    };
  }, [captureHistory, refreshLayers, updatePreview]);

  const addText = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fabric = await import("fabric");
    const value = textInput.trim() || "YOUR WORDS HERE";
    const text = nameObject(new fabric.IText(value, { left: 125, top: 220, width: 170, fontFamily, fontSize, fontWeight: 800, lineHeight: 1.1, fill: inkColor, textAlign: "center" }), value.slice(0, 28));
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
    setTab("layers");
  };

  const addShape = async (shape: "circle" | "star" | "triangle" | "flower") => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fabric = await import("fabric");
    let object: FabricObject;
    if (shape === "circle") object = nameObject(new fabric.Circle({ left: 178, top: 210, radius: 36, fill: inkColor }), "Circle shape");
    else if (shape === "triangle") object = nameObject(new fabric.Triangle({ left: 176, top: 205, width: 76, height: 75, fill: inkColor }), "Triangle shape");
    else if (shape === "flower") {
      const petals = Array.from({ length: 8 }, (_, index) => {
        const angle = (Math.PI * 2 * index) / 8;
        return { x: 40 + Math.cos(angle) * 19, y: 40 + Math.sin(angle) * 19 };
      });
      const points = petals.flatMap((point, index) => {
        const next = petals[(index + 1) % petals.length];
        return [point, { x: (point.x + next.x) / 2, y: (point.y + next.y) / 2 }];
      });
      object = nameObject(new fabric.Polygon(points, { left: 175, top: 208, fill: inkColor }), "Flower shape");
    } else {
      const points = Array.from({ length: 10 }, (_, index) => {
        const angle = (Math.PI / 5) * index - Math.PI / 2;
        const radius = index % 2 === 0 ? 40 : 18;
        return { x: 42 + Math.cos(angle) * radius, y: 42 + Math.sin(angle) * radius };
      });
      object = nameObject(new fabric.Polygon(points, { left: 175, top: 205, fill: inkColor }), "Star shape");
    }
    canvas.add(object);
    canvas.setActiveObject(object);
    canvas.requestRenderAll();
    setTab("layers");
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("That file is over 10 MB. Try a smaller print-ready image."); return; }
    if (!(["image/png", "image/jpeg", "image/svg+xml"].includes(file.type))) { setError("Please use a PNG, JPG, or SVG image."); return; }
    setError("");
    try {
      let dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read this image."));
        reader.readAsDataURL(file);
      });
      if (file.type === "image/svg+xml") {
        const raw = atob(dataUrl.split(",")[1] ?? "");
        const decoded = new TextDecoder().decode(Uint8Array.from(raw, (character) => character.charCodeAt(0)));
        const safe = safeSvgMarkup(decoded);
        dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(safe)))}`;
      }
      const fabric = await import("fabric");
      const image = await fabric.FabricImage.fromURL(dataUrl);
      const width = image.width || 100;
      const height = image.height || 100;
      const scale = Math.min(1, 150 / Math.max(width, height));
      image.set({ left: 135, top: 205, scaleX: scale, scaleY: scale, name: file.name.slice(0, 45) });
      canvasRef.current?.add(image);
      canvasRef.current?.setActiveObject(image);
      canvasRef.current?.requestRenderAll();
      setTab("layers");
    } catch {
      setError("We couldn't add that image. Try exporting it as a PNG first.");
    }
  };

  const undo = async (direction: -1 | 1) => {
    const target = historyIndexRef.current + direction;
    const canvas = canvasRef.current;
    if (!canvas || target < 0 || target >= historyRef.current.length) return;
    historyIndexRef.current = target;
    setHistoryCount({ index: target, length: historyRef.current.length });
    restoringRef.current = true;
    await canvas.loadFromJSON(JSON.parse(historyRef.current[target]));
    canvas.renderAll();
    restoringRef.current = false;
    refreshLayers(canvas);
    updatePreview(canvas);
  };

  const deleteLayer = () => {
    const canvas = canvasRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !active) return;
    canvas.remove(active);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  };

  const moveLayer = (layer: StudioLayer) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setActiveObject(layer.object);
    canvas.requestRenderAll();
    setActiveLabel(layer.label);
  };

  const nudgeSelection = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
    const canvas = canvasRef.current;
    const target = canvas?.getActiveObject();
    if (!canvas || !target) return;
    if (!(event.target instanceof HTMLCanvasElement) && !event.currentTarget.contains(document.activeElement)) return;
    event.preventDefault();
    const amount = event.shiftKey ? 10 : 1;
    target.set({ left: (target.left ?? 0) + (event.key === "ArrowLeft" ? -amount : event.key === "ArrowRight" ? amount : 0), top: (target.top ?? 0) + (event.key === "ArrowUp" ? -amount : event.key === "ArrowDown" ? amount : 0) });
    target.setCoords();
    canvas.requestRenderAll();
    captureHistory(canvas);
    updatePreview(canvas);
  };

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${designTitle.trim().replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "threadform-design"}.png`;
    link.href = canvas.toDataURL({ format: "png", multiplier: 3, filter: (object) => (object as unknown as { selectable?: boolean }).selectable !== false });
    link.click();
  };

  const saveDesign = async () => {
    if (!preview) { setError("Add something to your canvas before saving."); return; }
    setSaveState("Saving…");
    setError("");
    const payload = { title: designTitle.trim() || "My design", image: preview, productSlug: product.slug, isPublic };
    try {
      const response = await fetch("/api/designs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { id?: string; error?: string };
      const local = JSON.parse(localStorage.getItem("threadform-designs") ?? "[]") as Array<Record<string, string>>;
      const id = result.id ?? `local-${Date.now()}`;
      localStorage.setItem("threadform-designs", JSON.stringify([{ id, title: payload.title, imageUrl: preview, productSlug: product.slug, createdAt: new Date().toISOString() }, ...local].slice(0, 40)));
      setSaveState(response.ok ? "Saved to your designs ✓" : "Saved on this device ✓");
      if (isPublic && response.ok) setSaveState("Saved + ready to share ✓");
    } catch {
      const local = JSON.parse(localStorage.getItem("threadform-designs") ?? "[]") as Array<Record<string, string>>;
      localStorage.setItem("threadform-designs", JSON.stringify([{ id: `local-${Date.now()}`, title: payload.title, imageUrl: preview, productSlug: product.slug, createdAt: new Date().toISOString() }, ...local].slice(0, 40)));
      setSaveState("Saved on this device ✓");
    }
    window.setTimeout(() => setSaveState(""), 3200);
  };

  return <div className="studio-workspace" onKeyDown={nudgeSelection}>
    <div className="studio-topbar"><Link href="/" className="studio-back"><Icon name="arrow" size={16} /> <span>BACK TO THREADFORM</span></Link><div className="studio-title"><span className="studio-live-dot" /> DESIGN STUDIO <span>/</span> VOL. 01</div><div className="studio-top-actions"><button className="studio-undo" onClick={() => void undo(-1)} disabled={historyCount.index <= 0} aria-label="Undo"><Icon name="undo" size={17} /></button><button className="studio-undo" onClick={() => void undo(1)} disabled={historyCount.index >= historyCount.length - 1} aria-label="Redo"><Icon name="redo" size={17} /></button><span className="studio-separator" /><button className="studio-save-top" onClick={() => void saveDesign()}><Icon name="check" size={15} /> Save design</button></div></div>
    <div className="studio-main-grid">
      <section className="editor-column" aria-label="Design canvas"><div className="editor-heading"><div><span className="eyebrow">MAKE A LITTLE MAGIC</span><h1>Your idea, <span>in progress.</span></h1></div><div className="editor-product-selector"><label htmlFor="studio-product">ON A</label><select id="studio-product" value={product.slug} onChange={(event) => { const selected = products.find((item) => item.slug === event.target.value); if (selected) setProduct(selected); }} aria-label="Choose product">{products.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select><Icon name="chevron" size={14} /></div></div>
        <div className="studio-canvas-zone"><div className="canvas-side-note canvas-note-left">PRINT AREA<br />12 × 16 IN / 300 DPI</div><div className={`fabric-frame ${ready ? "fabric-ready" : ""}`} tabIndex={0} role="application" aria-label="Design canvas. Select an object and use arrow keys to nudge; hold Shift to move ten pixels."><div className="canvas-loading" hidden={ready}><span className="loading-spinner" /> Loading your canvas…</div><canvas ref={canvasEl} aria-label="Interactive Fabric design canvas" /><div className="print-area-guide" aria-hidden="true"><span>PRINT AREA</span></div></div><div className="canvas-side-note canvas-note-right">DRAG TO MOVE<br />SHIFT + ARROWS TO NUDGE</div><div className="canvas-watermark">THREADFORM / STUDIO</div></div>
        <div className="canvas-footer"><span><i /> {ready ? "CANVAS READY" : "GETTING THE PRESS READY"}</span><span>{layers.length} LAYER{layers.length === 1 ? "" : "S"} <i>·</i> 300 DPI</span><span>↑↓←→ NUDGE</span></div>
        <div className="mobile-tool-tabs" role="tablist" aria-label="Design tools">{([["upload", "Upload", "upload"], ["text", "Text", "type"], ["shapes", "Shapes", "spark"], ["layers", "Layers", "layers"]] as const).map(([key, label, icon]) => <button key={key} role="tab" aria-selected={tab === key} className={tab === key ? "tool-tab-active" : ""} onClick={() => setTab(key)}><Icon name={icon} size={17} /><span>{label}</span></button>)}</div>
        <div className="editor-toolbar" aria-label="Design tools"><div className="toolbar-tablist">{([["upload", "Upload", "upload"], ["text", "Text", "type"], ["shapes", "Shapes", "spark"], ["layers", "Layers", "layers"]] as const).map(([key, label, icon]) => <button key={key} className={tab === key ? "toolbar-active" : ""} onClick={() => setTab(key)}><Icon name={icon} size={16} />{label}</button>)}</div><div className="toolbar-content">
          {tab === "upload" && <div className="upload-tool"><input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleUpload} className="visually-hidden" aria-label="Upload a PNG, JPG, or SVG" /><button className="upload-dropzone" onClick={() => fileInputRef.current?.click()}><span className="upload-circle"><Icon name="upload" size={20} /></span><strong>Drop a little something here</strong><span>PNG, JPG, SVG · up to 10 MB</span><small>CHOOSE A FILE <Icon name="arrow" size={13} /></small></button><p>Tip: use a transparent PNG for the cleanest print.</p></div>}
          {tab === "text" && <div className="text-tool"><label className="tool-label" htmlFor="design-text">YOUR WORDS</label><textarea id="design-text" rows={2} value={textInput} onChange={(event) => setTextInput(event.target.value)} /><div className="text-tool-row"><label><span>TYPEFACE</span><select value={fontFamily} onChange={(event) => setFontFamily(event.target.value)}>{fonts.map((font) => <option key={font}>{font}</option>)}</select></label><label className="font-size-control"><span>SIZE · {fontSize}px</span><input type="range" min="14" max="68" step="2" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} /></label></div><div className="text-tool-row text-tool-bottom"><label className="ink-picker"><span>INK</span><input type="color" value={inkColor} onChange={(event) => setInkColor(event.target.value)} /><code>{inkColor.toUpperCase()}</code></label><button className="button button-dark add-text-button" onClick={addText}><Icon name="plus" size={16} /> Add to canvas</button></div></div>}
          {tab === "shapes" && <div className="shape-tool"><p>ONE SHAPE, BIG ENERGY.</p><div className="shape-library">{(["circle", "star", "triangle", "flower"] as const).map((shape) => <button key={shape} onClick={() => void addShape(shape)} aria-label={`Add ${shape}`}><PrintMark graphic={shape} color={inkColor} size={32} /><span>{shape}</span></button>)}</div><div className="text-tool-row text-tool-bottom"><label className="ink-picker"><span>SHAPE COLOR</span><input type="color" value={inkColor} onChange={(event) => setInkColor(event.target.value)} /><code>{inkColor.toUpperCase()}</code></label><span className="shape-tip">Grab a shape, then drag it into place.</span></div></div>}
          {tab === "layers" && <div className="layers-tool"><div className="layers-header"><span>{layers.length} ELEMENTS</span><span>{activeLabel}</span><button onClick={deleteLayer} disabled={!canvasRef.current?.getActiveObject()} aria-label="Delete selected layer"><Icon name="trash" size={15} /></button></div>{layers.length ? <div className="layers-list">{layers.map((layer, index) => <button className={`layer-row ${canvasRef.current?.getActiveObject() === layer.object ? "layer-active" : ""}`} key={layer.id} onClick={() => moveLayer(layer)}><span className="layer-number">0{layers.length - index}</span><span className="layer-preview">{layer.object.type === "image" ? <Icon name="image" size={15} /> : layer.object.type.includes("text") ? <Icon name="type" size={15} /> : <Icon name="spark" size={15} />}</span><span className="layer-name">{layer.label}</span><Icon name="arrowUp" size={13} /></button>)}</div> : <p className="layers-empty">Add text, shapes, or an image to build your first layer.</p>}</div>}
        </div></div>
        {error && <p className="studio-error" role="alert">{error}</p>}
      </section>
      <aside className="studio-preview-column"><div className="preview-heading"><div><span className="eyebrow">THE BIG REVEAL</span><h2>On the <span>real thing.</span></h2></div><span className="preview-live-pill"><i /> LIVE</span></div><div className="live-mockup-wrap"><div className="mockup-note">FRONT VIEW / NATURAL</div><div className="live-product-mockup"><img src={media.categories[product.category as keyof typeof media.categories] ?? media.products.tee} alt={`${product.name} product preview`} onError={(event) => { event.currentTarget.style.display = "none"; }} /><span className="mockup-tint" /><span className="live-design-overlay">{preview ? <img src={preview} alt="Live preview of your design" /> : <span className="preview-placeholder">YOUR<br />DESIGN<br />HERE</span>}</span><span className="mockup-label-sticker">PRINTED<br />JUST FOR<br /><b>YOU ✳</b></span></div><div className="mockup-product-info"><span><strong>{product.name}</strong><small>{product.colors[0]?.name} · {product.sizes[0]}</small></span><span className="preview-price">${(product.priceCents / 100).toFixed(2)}</span></div></div>
        <div className="design-save-panel"><label htmlFor="design-title">GIVE YOUR DESIGN A NAME</label><input id="design-title" maxLength={80} value={designTitle} onChange={(event) => setDesignTitle(event.target.value)} /><label className="publish-toggle"><input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} /><span className="toggle-track" /><span>Make this a public shop idea</span></label><div className="design-action-row"><button className="button button-primary save-design-button" onClick={() => void saveDesign()}><Icon name="check" size={16} /> {saveState || "Save this design"}</button><button className="download-design-button" onClick={downloadPng} aria-label="Download your design as a PNG"><Icon name="download" size={18} /></button></div><p><Icon name="lock" size={13} /> Your design belongs to you. Always.</p></div>
        <div className="studio-promo"><span>✳</span><p><strong>Nothing made until it is ordered.</strong><br />That's better for your ideas and the planet.</p><Link href="/shop">HOW IT WORKS <Icon name="arrowUp" size={13} /></Link></div>
      </aside>
    </div>
    <div className="studio-bottom-bar"><span>THREADFORM STUDIO <i>·</i> OPEN CANVAS, OPEN POSSIBILITIES</span><span>NEED A HAND? <a href="mailto:hello@threadform.example">ASK A HUMAN</a></span></div>
  </div>;
}
