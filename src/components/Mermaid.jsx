import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

export default function Mermaid({ chart }) {
    const mermaidRef = useRef(null);

    useEffect(() => {
        if (mermaidRef.current) {
            mermaid.initialize({
                startOnLoad: true,
                theme: 'default',
                securityLevel: 'loose',
            });

            mermaid.run({
                nodes: [mermaidRef.current]
            });
        }
    }, [chart]);

    return (
        <div className="mermaid" ref={mermaidRef}>
            {chart}
        </div>
    );
} 