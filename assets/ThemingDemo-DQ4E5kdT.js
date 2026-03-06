import{r as a,j as e}from"./vendor-react-frEwQuqu.js";import{g as f,a as T}from"./columns-DpK69Va2.js";import{D as C}from"./DocsLayout-rt9_y-9I.js";import{g as s,h as i,i as D,j as S,r as k,k as b,D as y}from"./opengridx-Bx9EhPzo.js";const v=`
import { useState } from 'react';
import {
    DataGrid,
    DataGridThemeProvider,
    darkTheme,
    roseTheme,
    emeraldTheme,
    amberTheme,
    compactTheme,
    GridPaginationModel,
    GridRowId,
} from '../../../lib';
import type { GridTheme } from '../../../lib';
import { generateEmployees } from '../../data/mockData';
import { allColumns } from '../../data/columns';
import { DocsLayout } from '../../components/DocsLayout';
import './ThemingDemo.css';

import sourceCode from './ThemingDemo.tsx?raw';

const presetThemes: Record<string, GridTheme> = {
    'Default': {},
    'Dark': darkTheme,
    'Rose': roseTheme,
    'Emerald': emeraldTheme,
    'Amber': amberTheme,
    'Compact': compactTheme,
    'Custom Purple': {
        colors: {
            primary: '#7c3aed',
            primaryDark: '#6d28d9',
            primaryLight: '#f5f3ff',
            primaryFocus: 'rgba(124, 58, 237, 0.4)',
        },
        grid: {
            headerBackground: '#f5f3ff',
            rowSelectedBackground: '#ede9fe',
            rowSelectedHoverBackground: '#ddd6fe',
            cellFocusBorder: '#7c3aed',
        },
        borders: {
            radiusLg: '16px',
        },
    },
    'Dark + Compact': {
        ...darkTheme,
        grid: {
            ...darkTheme.grid,
            ...compactTheme.grid,
        },
        typography: compactTheme.typography,
    },
};

const themeColors: Record<string, string> = {
    'Default': '#3b82f6',
    'Dark': '#60a5fa',
    'Rose': '#e11d48',
    'Emerald': '#059669',
    'Amber': '#d97706',
    'Compact': '#3b82f6',
    'Custom Purple': '#7c3aed',
    'Dark + Compact': '#60a5fa',
};

export default function ThemingDemo() {
    const [rows] = useState(() => generateEmployees(500));
    const [selectedTheme, setSelectedTheme] = useState('Default');
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10,
    });
    const [selectedRows, setSelectedRows] = useState<GridRowId[]>([]);

    const theme = presetThemes[selectedTheme];
    const isDark = selectedTheme === 'Dark' || selectedTheme === 'Dark + Compact';

    return (
        <DocsLayout
            title="Theming"
            description="Customize the DataGrid appearance using CSS variables via the DataGridThemeProvider component. Supports built-in presets (Dark, Compact, Emerald) or fully custom themes."
            sourceCode={sourceCode}
        >
            <div className="theming-container">
                <p className="theming-description">
                    Click a theme preset below. Each one sets <code>--ogx-*</code> CSS
                    variables via <code>&lt;DataGridThemeProvider&gt;</code> — no CSS
                    files, no CSS-in-JS, just inline custom properties.
                </p>

                <div className="theming-controls">
                    {Object.keys(presetThemes).map(name => (
                        <button
                            key={name}
                            onClick={() => setSelectedTheme(name)}
                            className={\`theme-preset-btn \${selectedTheme === name ? 'active' : ''}\`}
                            style={{
                                border: selectedTheme === name
                                    ? \`2px solid \${themeColors[name]}\`
                                    : '2px solid #e0e0e0',
                                background: selectedTheme === name
                                    ? \`\${themeColors[name]}15\`
                                    : '#fff',
                                color: selectedTheme === name
                                    ? themeColors[name]
                                    : '#555',
                            }}
                        >
                            <span
                                className="theme-indicator"
                                style={{ background: themeColors[name] }}
                            />
                            {name}
                        </button>
                    ))}
                </div>

                <div
                    className="grid-theme-preview-box"
                    style={{ background: isDark ? '#020617' : '#fff' }}
                >
                    <DataGridThemeProvider theme={theme}>
                        <DataGrid
                            rows={rows}
                            columns={allColumns}
                            checkboxSelection
                            rowSelectionModel={selectedRows}
                            onRowSelectionModelChange={setSelectedRows}
                            pagination
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}
                            height={500}
                            rowHeight={selectedTheme.includes('Compact') ? 36 : undefined}
                            headerHeight={selectedTheme.includes('Compact') ? 40 : undefined}
                        />
                    </DataGridThemeProvider>
                </div>

                <details className="theme-json-toggle">
                    <summary>View theme object</summary>
                    <pre>{JSON.stringify(theme, null, 2)}</pre>
                </details>
            </div>
        </DocsLayout>
    );
}
`,d={Default:{},Dark:i,Rose:k,Emerald:S,Amber:D,Compact:s,"Custom Purple":{colors:{primary:"#7c3aed",primaryDark:"#6d28d9",primaryLight:"#f5f3ff",primaryFocus:"rgba(124, 58, 237, 0.4)"},grid:{headerBackground:"#f5f3ff",rowSelectedBackground:"#ede9fe",rowSelectedHoverBackground:"#ddd6fe",cellFocusBorder:"#7c3aed"},borders:{radiusLg:"16px"}},"Dark + Compact":{...i,grid:{...i.grid,...s.grid},typography:s.typography}},r={Default:"#3b82f6",Dark:"#60a5fa",Rose:"#e11d48",Emerald:"#059669",Amber:"#d97706",Compact:"#3b82f6","Custom Purple":"#7c3aed","Dark + Compact":"#60a5fa"};function P(){const[c]=a.useState(()=>f(500)),[t,n]=a.useState("Default"),[l,h]=a.useState({page:0,pageSize:10}),[p,u]=a.useState([]),m=d[t],g=t==="Dark"||t==="Dark + Compact";return e.jsx(C,{title:"Theming",description:"Customize the DataGrid appearance using CSS variables via the DataGridThemeProvider component. Supports built-in presets (Dark, Compact, Emerald) or fully custom themes.",sourceCode:v,children:e.jsxs("div",{className:"theming-container",children:[e.jsxs("p",{className:"theming-description",children:["Click a theme preset below. Each one sets ",e.jsx("code",{children:"--ogx-*"})," CSS variables via ",e.jsx("code",{children:"<DataGridThemeProvider>"})," — no CSS files, no CSS-in-JS, just inline custom properties."]}),e.jsx("div",{className:"theming-controls",children:Object.keys(d).map(o=>e.jsxs("button",{onClick:()=>n(o),className:`theme-preset-btn ${t===o?"active":""}`,style:{border:t===o?`2px solid ${r[o]}`:"2px solid #e0e0e0",background:t===o?`${r[o]}15`:"#fff",color:t===o?r[o]:"#555"},children:[e.jsx("span",{className:"theme-indicator",style:{background:r[o]}}),o]},o))}),e.jsx("div",{className:"grid-theme-preview-box",style:{background:g?"#020617":"#fff"},children:e.jsx(b,{theme:m,children:e.jsx(y,{rows:c,columns:T,checkboxSelection:!0,rowSelectionModel:p,onRowSelectionModelChange:u,pagination:!0,paginationModel:l,onPaginationModelChange:h,height:500,rowHeight:t.includes("Compact")?36:void 0,headerHeight:t.includes("Compact")?40:void 0})})}),e.jsxs("details",{className:"theme-json-toggle",children:[e.jsx("summary",{children:"View theme object"}),e.jsx("pre",{children:JSON.stringify(m,null,2)})]})]})})}export{P as default};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGhlbWluZ0RlbW8tRFE0RTVrZFQuanMiLCJzb3VyY2VzIjpbIi4uLy4uL2V4YW1wbGVzL1RoZW1pbmdEZW1vL1RoZW1pbmdEZW1vLnRzeD9yYXciLCIuLi8uLi9leGFtcGxlcy9UaGVtaW5nRGVtby9UaGVtaW5nRGVtby50c3giXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgXCJcXG5pbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcXG5pbXBvcnQge1xcbiAgICBEYXRhR3JpZCxcXG4gICAgRGF0YUdyaWRUaGVtZVByb3ZpZGVyLFxcbiAgICBkYXJrVGhlbWUsXFxuICAgIHJvc2VUaGVtZSxcXG4gICAgZW1lcmFsZFRoZW1lLFxcbiAgICBhbWJlclRoZW1lLFxcbiAgICBjb21wYWN0VGhlbWUsXFxuICAgIEdyaWRQYWdpbmF0aW9uTW9kZWwsXFxuICAgIEdyaWRSb3dJZCxcXG59IGZyb20gJy4uLy4uLy4uL2xpYic7XFxuaW1wb3J0IHR5cGUgeyBHcmlkVGhlbWUgfSBmcm9tICcuLi8uLi8uLi9saWInO1xcbmltcG9ydCB7IGdlbmVyYXRlRW1wbG95ZWVzIH0gZnJvbSAnLi4vLi4vZGF0YS9tb2NrRGF0YSc7XFxuaW1wb3J0IHsgYWxsQ29sdW1ucyB9IGZyb20gJy4uLy4uL2RhdGEvY29sdW1ucyc7XFxuaW1wb3J0IHsgRG9jc0xheW91dCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvRG9jc0xheW91dCc7XFxuaW1wb3J0ICcuL1RoZW1pbmdEZW1vLmNzcyc7XFxuXFxuaW1wb3J0IHNvdXJjZUNvZGUgZnJvbSAnLi9UaGVtaW5nRGVtby50c3g/cmF3JztcXG5cXG5jb25zdCBwcmVzZXRUaGVtZXM6IFJlY29yZDxzdHJpbmcsIEdyaWRUaGVtZT4gPSB7XFxuICAgICdEZWZhdWx0Jzoge30sXFxuICAgICdEYXJrJzogZGFya1RoZW1lLFxcbiAgICAnUm9zZSc6IHJvc2VUaGVtZSxcXG4gICAgJ0VtZXJhbGQnOiBlbWVyYWxkVGhlbWUsXFxuICAgICdBbWJlcic6IGFtYmVyVGhlbWUsXFxuICAgICdDb21wYWN0JzogY29tcGFjdFRoZW1lLFxcbiAgICAnQ3VzdG9tIFB1cnBsZSc6IHtcXG4gICAgICAgIGNvbG9yczoge1xcbiAgICAgICAgICAgIHByaW1hcnk6ICcjN2MzYWVkJyxcXG4gICAgICAgICAgICBwcmltYXJ5RGFyazogJyM2ZDI4ZDknLFxcbiAgICAgICAgICAgIHByaW1hcnlMaWdodDogJyNmNWYzZmYnLFxcbiAgICAgICAgICAgIHByaW1hcnlGb2N1czogJ3JnYmEoMTI0LCA1OCwgMjM3LCAwLjQpJyxcXG4gICAgICAgIH0sXFxuICAgICAgICBncmlkOiB7XFxuICAgICAgICAgICAgaGVhZGVyQmFja2dyb3VuZDogJyNmNWYzZmYnLFxcbiAgICAgICAgICAgIHJvd1NlbGVjdGVkQmFja2dyb3VuZDogJyNlZGU5ZmUnLFxcbiAgICAgICAgICAgIHJvd1NlbGVjdGVkSG92ZXJCYWNrZ3JvdW5kOiAnI2RkZDZmZScsXFxuICAgICAgICAgICAgY2VsbEZvY3VzQm9yZGVyOiAnIzdjM2FlZCcsXFxuICAgICAgICB9LFxcbiAgICAgICAgYm9yZGVyczoge1xcbiAgICAgICAgICAgIHJhZGl1c0xnOiAnMTZweCcsXFxuICAgICAgICB9LFxcbiAgICB9LFxcbiAgICAnRGFyayArIENvbXBhY3QnOiB7XFxuICAgICAgICAuLi5kYXJrVGhlbWUsXFxuICAgICAgICBncmlkOiB7XFxuICAgICAgICAgICAgLi4uZGFya1RoZW1lLmdyaWQsXFxuICAgICAgICAgICAgLi4uY29tcGFjdFRoZW1lLmdyaWQsXFxuICAgICAgICB9LFxcbiAgICAgICAgdHlwb2dyYXBoeTogY29tcGFjdFRoZW1lLnR5cG9ncmFwaHksXFxuICAgIH0sXFxufTtcXG5cXG5jb25zdCB0aGVtZUNvbG9yczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcXG4gICAgJ0RlZmF1bHQnOiAnIzNiODJmNicsXFxuICAgICdEYXJrJzogJyM2MGE1ZmEnLFxcbiAgICAnUm9zZSc6ICcjZTExZDQ4JyxcXG4gICAgJ0VtZXJhbGQnOiAnIzA1OTY2OScsXFxuICAgICdBbWJlcic6ICcjZDk3NzA2JyxcXG4gICAgJ0NvbXBhY3QnOiAnIzNiODJmNicsXFxuICAgICdDdXN0b20gUHVycGxlJzogJyM3YzNhZWQnLFxcbiAgICAnRGFyayArIENvbXBhY3QnOiAnIzYwYTVmYScsXFxufTtcXG5cXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBUaGVtaW5nRGVtbygpIHtcXG4gICAgY29uc3QgW3Jvd3NdID0gdXNlU3RhdGUoKCkgPT4gZ2VuZXJhdGVFbXBsb3llZXMoNTAwKSk7XFxuICAgIGNvbnN0IFtzZWxlY3RlZFRoZW1lLCBzZXRTZWxlY3RlZFRoZW1lXSA9IHVzZVN0YXRlKCdEZWZhdWx0Jyk7XFxuICAgIGNvbnN0IFtwYWdpbmF0aW9uTW9kZWwsIHNldFBhZ2luYXRpb25Nb2RlbF0gPSB1c2VTdGF0ZTxHcmlkUGFnaW5hdGlvbk1vZGVsPih7XFxuICAgICAgICBwYWdlOiAwLFxcbiAgICAgICAgcGFnZVNpemU6IDEwLFxcbiAgICB9KTtcXG4gICAgY29uc3QgW3NlbGVjdGVkUm93cywgc2V0U2VsZWN0ZWRSb3dzXSA9IHVzZVN0YXRlPEdyaWRSb3dJZFtdPihbXSk7XFxuXFxuICAgIGNvbnN0IHRoZW1lID0gcHJlc2V0VGhlbWVzW3NlbGVjdGVkVGhlbWVdO1xcbiAgICBjb25zdCBpc0RhcmsgPSBzZWxlY3RlZFRoZW1lID09PSAnRGFyaycgfHwgc2VsZWN0ZWRUaGVtZSA9PT0gJ0RhcmsgKyBDb21wYWN0JztcXG5cXG4gICAgcmV0dXJuIChcXG4gICAgICAgIDxEb2NzTGF5b3V0XFxuICAgICAgICAgICAgdGl0bGU9XFxcIlRoZW1pbmdcXFwiXFxuICAgICAgICAgICAgZGVzY3JpcHRpb249XFxcIkN1c3RvbWl6ZSB0aGUgRGF0YUdyaWQgYXBwZWFyYW5jZSB1c2luZyBDU1MgdmFyaWFibGVzIHZpYSB0aGUgRGF0YUdyaWRUaGVtZVByb3ZpZGVyIGNvbXBvbmVudC4gU3VwcG9ydHMgYnVpbHQtaW4gcHJlc2V0cyAoRGFyaywgQ29tcGFjdCwgRW1lcmFsZCkgb3IgZnVsbHkgY3VzdG9tIHRoZW1lcy5cXFwiXFxuICAgICAgICAgICAgc291cmNlQ29kZT17c291cmNlQ29kZX1cXG4gICAgICAgID5cXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwidGhlbWluZy1jb250YWluZXJcXFwiPlxcbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XFxcInRoZW1pbmctZGVzY3JpcHRpb25cXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgQ2xpY2sgYSB0aGVtZSBwcmVzZXQgYmVsb3cuIEVhY2ggb25lIHNldHMgPGNvZGU+LS1vZ3gtKjwvY29kZT4gQ1NTXFxuICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZXMgdmlhIDxjb2RlPiZsdDtEYXRhR3JpZFRoZW1lUHJvdmlkZXImZ3Q7PC9jb2RlPiDigJQgbm8gQ1NTXFxuICAgICAgICAgICAgICAgICAgICBmaWxlcywgbm8gQ1NTLWluLUpTLCBqdXN0IGlubGluZSBjdXN0b20gcHJvcGVydGllcy5cXG4gICAgICAgICAgICAgICAgPC9wPlxcblxcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cXFwidGhlbWluZy1jb250cm9sc1xcXCI+XFxuICAgICAgICAgICAgICAgICAgICB7T2JqZWN0LmtleXMocHJlc2V0VGhlbWVzKS5tYXAobmFtZSA9PiAoXFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk9e25hbWV9XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNlbGVjdGVkVGhlbWUobmFtZSl9XFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YHRoZW1lLXByZXNldC1idG4gJHtzZWxlY3RlZFRoZW1lID09PSBuYW1lID8gJ2FjdGl2ZScgOiAnJ31gfVxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiBzZWxlY3RlZFRoZW1lID09PSBuYW1lXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBgMnB4IHNvbGlkICR7dGhlbWVDb2xvcnNbbmFtZV19YFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJzJweCBzb2xpZCAjZTBlMGUwJyxcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHNlbGVjdGVkVGhlbWUgPT09IG5hbWVcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGAke3RoZW1lQ29sb3JzW25hbWVdfTE1YFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJyNmZmYnLFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHNlbGVjdGVkVGhlbWUgPT09IG5hbWVcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHRoZW1lQ29sb3JzW25hbWVdXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnIzU1NScsXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XFxuICAgICAgICAgICAgICAgICAgICAgICAgPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhblxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVxcXCJ0aGVtZS1pbmRpY2F0b3JcXFwiXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyBiYWNrZ3JvdW5kOiB0aGVtZUNvbG9yc1tuYW1lXSB9fVxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7bmFtZX1cXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cXG4gICAgICAgICAgICAgICAgICAgICkpfVxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXG5cXG4gICAgICAgICAgICAgICAgPGRpdlxcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVxcXCJncmlkLXRoZW1lLXByZXZpZXctYm94XFxcIlxcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgYmFja2dyb3VuZDogaXNEYXJrID8gJyMwMjA2MTcnIDogJyNmZmYnIH19XFxuICAgICAgICAgICAgICAgID5cXG4gICAgICAgICAgICAgICAgICAgIDxEYXRhR3JpZFRoZW1lUHJvdmlkZXIgdGhlbWU9e3RoZW1lfT5cXG4gICAgICAgICAgICAgICAgICAgICAgICA8RGF0YUdyaWRcXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93cz17cm93c31cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1ucz17YWxsQ29sdW1uc31cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tib3hTZWxlY3Rpb25cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93U2VsZWN0aW9uTW9kZWw9e3NlbGVjdGVkUm93c31cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Sb3dTZWxlY3Rpb25Nb2RlbENoYW5nZT17c2V0U2VsZWN0ZWRSb3dzfVxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb25Nb2RlbD17cGFnaW5hdGlvbk1vZGVsfVxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblBhZ2luYXRpb25Nb2RlbENoYW5nZT17c2V0UGFnaW5hdGlvbk1vZGVsfVxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9ezUwMH1cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93SGVpZ2h0PXtzZWxlY3RlZFRoZW1lLmluY2x1ZGVzKCdDb21wYWN0JykgPyAzNiA6IHVuZGVmaW5lZH1cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVySGVpZ2h0PXtzZWxlY3RlZFRoZW1lLmluY2x1ZGVzKCdDb21wYWN0JykgPyA0MCA6IHVuZGVmaW5lZH1cXG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxcbiAgICAgICAgICAgICAgICAgICAgPC9EYXRhR3JpZFRoZW1lUHJvdmlkZXI+XFxuICAgICAgICAgICAgICAgIDwvZGl2PlxcblxcbiAgICAgICAgICAgICAgICA8ZGV0YWlscyBjbGFzc05hbWU9XFxcInRoZW1lLWpzb24tdG9nZ2xlXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgIDxzdW1tYXJ5PlZpZXcgdGhlbWUgb2JqZWN0PC9zdW1tYXJ5PlxcbiAgICAgICAgICAgICAgICAgICAgPHByZT57SlNPTi5zdHJpbmdpZnkodGhlbWUsIG51bGwsIDIpfTwvcHJlPlxcbiAgICAgICAgICAgICAgICA8L2RldGFpbHM+XFxuICAgICAgICAgICAgPC9kaXY+XFxuICAgICAgICA8L0RvY3NMYXlvdXQ+XFxuICAgICk7XFxufVxcblwiIiwiXG5pbXBvcnQgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7XG4gICAgRGF0YUdyaWQsXG4gICAgRGF0YUdyaWRUaGVtZVByb3ZpZGVyLFxuICAgIGRhcmtUaGVtZSxcbiAgICByb3NlVGhlbWUsXG4gICAgZW1lcmFsZFRoZW1lLFxuICAgIGFtYmVyVGhlbWUsXG4gICAgY29tcGFjdFRoZW1lLFxuICAgIEdyaWRQYWdpbmF0aW9uTW9kZWwsXG4gICAgR3JpZFJvd0lkLFxufSBmcm9tICcuLi8uLi8uLi9saWInO1xuaW1wb3J0IHR5cGUgeyBHcmlkVGhlbWUgfSBmcm9tICcuLi8uLi8uLi9saWInO1xuaW1wb3J0IHsgZ2VuZXJhdGVFbXBsb3llZXMgfSBmcm9tICcuLi8uLi9kYXRhL21vY2tEYXRhJztcbmltcG9ydCB7IGFsbENvbHVtbnMgfSBmcm9tICcuLi8uLi9kYXRhL2NvbHVtbnMnO1xuaW1wb3J0IHsgRG9jc0xheW91dCB9IGZyb20gJy4uLy4uL2NvbXBvbmVudHMvRG9jc0xheW91dCc7XG5pbXBvcnQgJy4vVGhlbWluZ0RlbW8uY3NzJztcblxuaW1wb3J0IHNvdXJjZUNvZGUgZnJvbSAnLi9UaGVtaW5nRGVtby50c3g/cmF3JztcblxuY29uc3QgcHJlc2V0VGhlbWVzOiBSZWNvcmQ8c3RyaW5nLCBHcmlkVGhlbWU+ID0ge1xuICAgICdEZWZhdWx0Jzoge30sXG4gICAgJ0RhcmsnOiBkYXJrVGhlbWUsXG4gICAgJ1Jvc2UnOiByb3NlVGhlbWUsXG4gICAgJ0VtZXJhbGQnOiBlbWVyYWxkVGhlbWUsXG4gICAgJ0FtYmVyJzogYW1iZXJUaGVtZSxcbiAgICAnQ29tcGFjdCc6IGNvbXBhY3RUaGVtZSxcbiAgICAnQ3VzdG9tIFB1cnBsZSc6IHtcbiAgICAgICAgY29sb3JzOiB7XG4gICAgICAgICAgICBwcmltYXJ5OiAnIzdjM2FlZCcsXG4gICAgICAgICAgICBwcmltYXJ5RGFyazogJyM2ZDI4ZDknLFxuICAgICAgICAgICAgcHJpbWFyeUxpZ2h0OiAnI2Y1ZjNmZicsXG4gICAgICAgICAgICBwcmltYXJ5Rm9jdXM6ICdyZ2JhKDEyNCwgNTgsIDIzNywgMC40KScsXG4gICAgICAgIH0sXG4gICAgICAgIGdyaWQ6IHtcbiAgICAgICAgICAgIGhlYWRlckJhY2tncm91bmQ6ICcjZjVmM2ZmJyxcbiAgICAgICAgICAgIHJvd1NlbGVjdGVkQmFja2dyb3VuZDogJyNlZGU5ZmUnLFxuICAgICAgICAgICAgcm93U2VsZWN0ZWRIb3ZlckJhY2tncm91bmQ6ICcjZGRkNmZlJyxcbiAgICAgICAgICAgIGNlbGxGb2N1c0JvcmRlcjogJyM3YzNhZWQnLFxuICAgICAgICB9LFxuICAgICAgICBib3JkZXJzOiB7XG4gICAgICAgICAgICByYWRpdXNMZzogJzE2cHgnLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgJ0RhcmsgKyBDb21wYWN0Jzoge1xuICAgICAgICAuLi5kYXJrVGhlbWUsXG4gICAgICAgIGdyaWQ6IHtcbiAgICAgICAgICAgIC4uLmRhcmtUaGVtZS5ncmlkLFxuICAgICAgICAgICAgLi4uY29tcGFjdFRoZW1lLmdyaWQsXG4gICAgICAgIH0sXG4gICAgICAgIHR5cG9ncmFwaHk6IGNvbXBhY3RUaGVtZS50eXBvZ3JhcGh5LFxuICAgIH0sXG59O1xuXG5jb25zdCB0aGVtZUNvbG9yczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAnRGVmYXVsdCc6ICcjM2I4MmY2JyxcbiAgICAnRGFyayc6ICcjNjBhNWZhJyxcbiAgICAnUm9zZSc6ICcjZTExZDQ4JyxcbiAgICAnRW1lcmFsZCc6ICcjMDU5NjY5JyxcbiAgICAnQW1iZXInOiAnI2Q5NzcwNicsXG4gICAgJ0NvbXBhY3QnOiAnIzNiODJmNicsXG4gICAgJ0N1c3RvbSBQdXJwbGUnOiAnIzdjM2FlZCcsXG4gICAgJ0RhcmsgKyBDb21wYWN0JzogJyM2MGE1ZmEnLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gVGhlbWluZ0RlbW8oKSB7XG4gICAgY29uc3QgW3Jvd3NdID0gdXNlU3RhdGUoKCkgPT4gZ2VuZXJhdGVFbXBsb3llZXMoNTAwKSk7XG4gICAgY29uc3QgW3NlbGVjdGVkVGhlbWUsIHNldFNlbGVjdGVkVGhlbWVdID0gdXNlU3RhdGUoJ0RlZmF1bHQnKTtcbiAgICBjb25zdCBbcGFnaW5hdGlvbk1vZGVsLCBzZXRQYWdpbmF0aW9uTW9kZWxdID0gdXNlU3RhdGU8R3JpZFBhZ2luYXRpb25Nb2RlbD4oe1xuICAgICAgICBwYWdlOiAwLFxuICAgICAgICBwYWdlU2l6ZTogMTAsXG4gICAgfSk7XG4gICAgY29uc3QgW3NlbGVjdGVkUm93cywgc2V0U2VsZWN0ZWRSb3dzXSA9IHVzZVN0YXRlPEdyaWRSb3dJZFtdPihbXSk7XG5cbiAgICBjb25zdCB0aGVtZSA9IHByZXNldFRoZW1lc1tzZWxlY3RlZFRoZW1lXTtcbiAgICBjb25zdCBpc0RhcmsgPSBzZWxlY3RlZFRoZW1lID09PSAnRGFyaycgfHwgc2VsZWN0ZWRUaGVtZSA9PT0gJ0RhcmsgKyBDb21wYWN0JztcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxEb2NzTGF5b3V0XG4gICAgICAgICAgICB0aXRsZT1cIlRoZW1pbmdcIlxuICAgICAgICAgICAgZGVzY3JpcHRpb249XCJDdXN0b21pemUgdGhlIERhdGFHcmlkIGFwcGVhcmFuY2UgdXNpbmcgQ1NTIHZhcmlhYmxlcyB2aWEgdGhlIERhdGFHcmlkVGhlbWVQcm92aWRlciBjb21wb25lbnQuIFN1cHBvcnRzIGJ1aWx0LWluIHByZXNldHMgKERhcmssIENvbXBhY3QsIEVtZXJhbGQpIG9yIGZ1bGx5IGN1c3RvbSB0aGVtZXMuXCJcbiAgICAgICAgICAgIHNvdXJjZUNvZGU9e3NvdXJjZUNvZGV9XG4gICAgICAgID5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGhlbWluZy1jb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0aGVtaW5nLWRlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgIENsaWNrIGEgdGhlbWUgcHJlc2V0IGJlbG93LiBFYWNoIG9uZSBzZXRzIDxjb2RlPi0tb2d4LSo8L2NvZGU+IENTU1xuICAgICAgICAgICAgICAgICAgICB2YXJpYWJsZXMgdmlhIDxjb2RlPiZsdDtEYXRhR3JpZFRoZW1lUHJvdmlkZXImZ3Q7PC9jb2RlPiDigJQgbm8gQ1NTXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzLCBubyBDU1MtaW4tSlMsIGp1c3QgaW5saW5lIGN1c3RvbSBwcm9wZXJ0aWVzLlxuICAgICAgICAgICAgICAgIDwvcD5cblxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGhlbWluZy1jb250cm9sc1wiPlxuICAgICAgICAgICAgICAgICAgICB7T2JqZWN0LmtleXMocHJlc2V0VGhlbWVzKS5tYXAobmFtZSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5PXtuYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNlbGVjdGVkVGhlbWUobmFtZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgdGhlbWUtcHJlc2V0LWJ0biAke3NlbGVjdGVkVGhlbWUgPT09IG5hbWUgPyAnYWN0aXZlJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiBzZWxlY3RlZFRoZW1lID09PSBuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IGAycHggc29saWQgJHt0aGVtZUNvbG9yc1tuYW1lXX1gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICcycHggc29saWQgI2UwZTBlMCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHNlbGVjdGVkVGhlbWUgPT09IG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gYCR7dGhlbWVDb2xvcnNbbmFtZV19MTVgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICcjZmZmJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHNlbGVjdGVkVGhlbWUgPT09IG5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdGhlbWVDb2xvcnNbbmFtZV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJyM1NTUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidGhlbWUtaW5kaWNhdG9yXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgYmFja2dyb3VuZDogdGhlbWVDb2xvcnNbbmFtZV0gfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtuYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJncmlkLXRoZW1lLXByZXZpZXctYm94XCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgYmFja2dyb3VuZDogaXNEYXJrID8gJyMwMjA2MTcnIDogJyNmZmYnIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8RGF0YUdyaWRUaGVtZVByb3ZpZGVyIHRoZW1lPXt0aGVtZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8RGF0YUdyaWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dzPXtyb3dzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbnM9e2FsbENvbHVtbnN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tib3hTZWxlY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dTZWxlY3Rpb25Nb2RlbD17c2VsZWN0ZWRSb3dzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uUm93U2VsZWN0aW9uTW9kZWxDaGFuZ2U9e3NldFNlbGVjdGVkUm93c31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnaW5hdGlvbk1vZGVsPXtwYWdpbmF0aW9uTW9kZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25QYWdpbmF0aW9uTW9kZWxDaGFuZ2U9e3NldFBhZ2luYXRpb25Nb2RlbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9ezUwMH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dIZWlnaHQ9e3NlbGVjdGVkVGhlbWUuaW5jbHVkZXMoJ0NvbXBhY3QnKSA/IDM2IDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlckhlaWdodD17c2VsZWN0ZWRUaGVtZS5pbmNsdWRlcygnQ29tcGFjdCcpID8gNDAgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8L0RhdGFHcmlkVGhlbWVQcm92aWRlcj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgIDxkZXRhaWxzIGNsYXNzTmFtZT1cInRoZW1lLWpzb24tdG9nZ2xlXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzdW1tYXJ5PlZpZXcgdGhlbWUgb2JqZWN0PC9zdW1tYXJ5PlxuICAgICAgICAgICAgICAgICAgICA8cHJlPntKU09OLnN0cmluZ2lmeSh0aGVtZSwgbnVsbCwgMil9PC9wcmU+XG4gICAgICAgICAgICAgICAgPC9kZXRhaWxzPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvRG9jc0xheW91dD5cbiAgICApO1xufVxuIl0sIm5hbWVzIjpbInNvdXJjZUNvZGUiLCJwcmVzZXRUaGVtZXMiLCJkYXJrVGhlbWUiLCJyb3NlVGhlbWUiLCJlbWVyYWxkVGhlbWUiLCJhbWJlclRoZW1lIiwiY29tcGFjdFRoZW1lIiwidGhlbWVDb2xvcnMiLCJUaGVtaW5nRGVtbyIsInJvd3MiLCJ1c2VTdGF0ZSIsImdlbmVyYXRlRW1wbG95ZWVzIiwic2VsZWN0ZWRUaGVtZSIsInNldFNlbGVjdGVkVGhlbWUiLCJwYWdpbmF0aW9uTW9kZWwiLCJzZXRQYWdpbmF0aW9uTW9kZWwiLCJzZWxlY3RlZFJvd3MiLCJzZXRTZWxlY3RlZFJvd3MiLCJ0aGVtZSIsImlzRGFyayIsImpzeCIsIkRvY3NMYXlvdXQiLCJqc3hzIiwibmFtZSIsIkRhdGFHcmlkVGhlbWVQcm92aWRlciIsIkRhdGFHcmlkIiwiYWxsQ29sdW1ucyJdLCJtYXBwaW5ncyI6IjBPQUFBLE1BQUFBLEVBQWU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUNxQlRDLEVBQTBDLENBQzVDLFFBQVcsQ0FBQSxFQUNYLEtBQVFDLEVBQ1IsS0FBUUMsRUFDUixRQUFXQyxFQUNYLE1BQVNDLEVBQ1QsUUFBV0MsRUFDWCxnQkFBaUIsQ0FDYixPQUFRLENBQ0osUUFBUyxVQUNULFlBQWEsVUFDYixhQUFjLFVBQ2QsYUFBYyx5QkFBQSxFQUVsQixLQUFNLENBQ0YsaUJBQWtCLFVBQ2xCLHNCQUF1QixVQUN2QiwyQkFBNEIsVUFDNUIsZ0JBQWlCLFNBQUEsRUFFckIsUUFBUyxDQUNMLFNBQVUsTUFBQSxDQUNkLEVBRUosaUJBQWtCLENBQ2QsR0FBR0osRUFDSCxLQUFNLENBQ0YsR0FBR0EsRUFBVSxLQUNiLEdBQUdJLEVBQWEsSUFBQSxFQUVwQixXQUFZQSxFQUFhLFVBQUEsQ0FFakMsRUFFTUMsRUFBc0MsQ0FDeEMsUUFBVyxVQUNYLEtBQVEsVUFDUixLQUFRLFVBQ1IsUUFBVyxVQUNYLE1BQVMsVUFDVCxRQUFXLFVBQ1gsZ0JBQWlCLFVBQ2pCLGlCQUFrQixTQUN0QixFQUVBLFNBQXdCQyxHQUFjLENBQ2xDLEtBQU0sQ0FBQ0MsQ0FBSSxFQUFJQyxFQUFBQSxTQUFTLElBQU1DLEVBQWtCLEdBQUcsQ0FBQyxFQUM5QyxDQUFDQyxFQUFlQyxDQUFnQixFQUFJSCxFQUFBQSxTQUFTLFNBQVMsRUFDdEQsQ0FBQ0ksRUFBaUJDLENBQWtCLEVBQUlMLFdBQThCLENBQ3hFLEtBQU0sRUFDTixTQUFVLEVBQUEsQ0FDYixFQUNLLENBQUNNLEVBQWNDLENBQWUsRUFBSVAsRUFBQUEsU0FBc0IsQ0FBQSxDQUFFLEVBRTFEUSxFQUFRakIsRUFBYVcsQ0FBYSxFQUNsQ08sRUFBU1AsSUFBa0IsUUFBVUEsSUFBa0IsaUJBRTdELE9BQ0lRLEVBQUFBLElBQUNDLEVBQUEsQ0FDRyxNQUFNLFVBQ04sWUFBWSw0S0FDWixXQUFBckIsRUFFQSxTQUFBc0IsRUFBQUEsS0FBQyxNQUFBLENBQUksVUFBVSxvQkFDWCxTQUFBLENBQUFBLEVBQUFBLEtBQUMsSUFBQSxDQUFFLFVBQVUsc0JBQXNCLFNBQUEsQ0FBQSw2Q0FDV0YsRUFBQUEsSUFBQyxRQUFLLFNBQUEsU0FBQSxDQUFPLEVBQU8sc0JBQ2hEQSxFQUFBQSxJQUFDLFFBQUssU0FBQSx5QkFBQSxDQUE2QixFQUFPLCtEQUFBLEVBRTVELEVBRUFBLEVBQUFBLElBQUMsT0FBSSxVQUFVLG1CQUNWLGdCQUFPLEtBQUtuQixDQUFZLEVBQUUsSUFBSXNCLEdBQzNCRCxFQUFBQSxLQUFDLFNBQUEsQ0FFRyxRQUFTLElBQU1ULEVBQWlCVSxDQUFJLEVBQ3BDLFVBQVcsb0JBQW9CWCxJQUFrQlcsRUFBTyxTQUFXLEVBQUUsR0FDckUsTUFBTyxDQUNILE9BQVFYLElBQWtCVyxFQUNwQixhQUFhaEIsRUFBWWdCLENBQUksQ0FBQyxHQUM5QixvQkFDTixXQUFZWCxJQUFrQlcsRUFDeEIsR0FBR2hCLEVBQVlnQixDQUFJLENBQUMsS0FDcEIsT0FDTixNQUFPWCxJQUFrQlcsRUFDbkJoQixFQUFZZ0IsQ0FBSSxFQUNoQixNQUFBLEVBR1YsU0FBQSxDQUFBSCxFQUFBQSxJQUFDLE9BQUEsQ0FDRyxVQUFVLGtCQUNWLE1BQU8sQ0FBRSxXQUFZYixFQUFZZ0IsQ0FBSSxDQUFBLENBQUUsQ0FBQSxFQUUxQ0EsQ0FBQSxDQUFBLEVBbkJJQSxDQUFBLENBcUJaLEVBQ0wsRUFFQUgsRUFBQUEsSUFBQyxNQUFBLENBQ0csVUFBVSx5QkFDVixNQUFPLENBQUUsV0FBWUQsRUFBUyxVQUFZLE1BQUEsRUFFMUMsU0FBQUMsRUFBQUEsSUFBQ0ksR0FBc0IsTUFBQU4sRUFDbkIsU0FBQUUsRUFBQUEsSUFBQ0ssRUFBQSxDQUNHLEtBQUFoQixFQUNBLFFBQVNpQixFQUNULGtCQUFpQixHQUNqQixrQkFBbUJWLEVBQ25CLDBCQUEyQkMsRUFDM0IsV0FBVSxHQUNWLGdCQUFBSCxFQUNBLHdCQUF5QkMsRUFDekIsT0FBUSxJQUNSLFVBQVdILEVBQWMsU0FBUyxTQUFTLEVBQUksR0FBSyxPQUNwRCxhQUFjQSxFQUFjLFNBQVMsU0FBUyxFQUFJLEdBQUssTUFBQSxDQUFBLENBQzNELENBQ0osQ0FBQSxDQUFBLEVBR0pVLEVBQUFBLEtBQUMsVUFBQSxDQUFRLFVBQVUsb0JBQ2YsU0FBQSxDQUFBRixFQUFBQSxJQUFDLFdBQVEsU0FBQSxtQkFBQSxDQUFpQixRQUN6QixNQUFBLENBQUssU0FBQSxLQUFLLFVBQVVGLEVBQU8sS0FBTSxDQUFDLENBQUEsQ0FBRSxDQUFBLENBQUEsQ0FDekMsQ0FBQSxDQUFBLENBQ0osQ0FBQSxDQUFBLENBR1oifQ==
