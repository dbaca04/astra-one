import { useEffect, useRef } from "react";
import mermaid from "mermaid";

export default function Mermaid({ chart }) {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) {
            mermaid.initialize({ startOnLoad: false, theme: "default" });
            mermaid.render(`mermaid-${Math.random()}`, chart, (svgCode) => {
                ref.current.innerHTML = svgCode;
            });
        }
    }, [chart]);

    return <div ref={ref} />;
} 