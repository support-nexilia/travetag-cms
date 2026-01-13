import React, { useEffect } from "react";
import { GraphiQL } from "graphiql";

// ⬇️ CONFIGURAZIONE MONACO (fix errore toUrl)
function setupMonaco() {
  if (typeof window === "undefined") return;

  (self as any).MonacoEnvironment = {
    getWorker(_: any, label: string) {
      switch (label) {
        case "json":
          return new Worker(
            new URL(
              "monaco-editor/esm/vs/language/json/json.worker",
              import.meta.url
            ),
            { type: "module" }
          );
        case "graphql":
        case "editorWorkerService":
        default:
          return new Worker(
            new URL(
              "monaco-editor/esm/vs/editor/editor.worker",
              import.meta.url
            ),
            { type: "module" }
          );
      }
    },
  };
}

export default function GraphQLPlayground() {
  useEffect(() => {
    setupMonaco();
  }, []);

  return (
    <div style={{ height: "100vh" }}>
      <GraphiQL
        fetcher={async (params) => {
          const response = await fetch("/api/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
          });
          return response.json();
        }}
      />
    </div>
  );
}
