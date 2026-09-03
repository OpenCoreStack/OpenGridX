// Ambient declarations for optional peer dependencies.
// These packages are listed in peerDependenciesMeta as optional and are NOT
// installed in devDependencies. The declarations here let TypeScript accept
// the dynamic imports without requiring the packages at build time.

declare module 'jspdf' {
    // Minimal shape — exportToPdf.ts only uses the JsPDFDoc interface it defines.
    // The full jsPDF types are available when the consumer installs the package.
    const JsPDF: new (opts?: Record<string, unknown>) => unknown;
    export default JsPDF;
}

declare module 'jspdf-autotable' {
    // Side-effect import that augments jsPDF.prototype.autoTable.
    const autoTable: unknown;
    export default autoTable;
}
