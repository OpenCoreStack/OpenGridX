import { Highlight, themes } from 'prism-react-renderer';
import './CodeBlock.css';

interface CodeBlockProps {
    code: string;
    language?: 'tsx' | 'typescript' | 'css' | 'json' | 'bash';
}

/** Syntax-highlighted source (prism-react-renderer, VS Code dark theme) for the demo's code samples. */
export function CodeBlock({ code, language = 'tsx' }: CodeBlockProps) {
    return (
        <Highlight code={code.trimEnd()} language={language} theme={themes.vsDark}>
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
                // Prism hands out its theme colours as style objects per line and token.
                <pre className={`docs-code-block docs-code-block--highlighted ${className}`} style={style}>
                    <code>
                        {tokens.map((line, i) => (
                            <div key={i} {...getLineProps({ line })}>
                                {line.map((token, key) => <span key={key} {...getTokenProps({ token })} />)}
                            </div>
                        ))}
                    </code>
                </pre>
            )}
        </Highlight>
    );
}
